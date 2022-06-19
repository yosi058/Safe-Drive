# Import required libraries and packages into the coding environment
from concurrent.futures.thread import ThreadPoolExecutor
import pyttsx3
import winsound
from imutils import face_utils
import numpy as np
import dlib
import cv2
import ssl
import subprocess as sp
import re
import certifi
import geopy
from geopy import Nominatim
from safe_drive_project_files.Location import LocationInfo
from safe_drive_project_files.dbAlgo import Db
from safe_drive_project_files.helper_function import detect, cal_left_eye, cal_right_eye, cal_yawn, speak

stop_drive = False
accuracy = 10  # Starting desired accuracy is fine and builds at x1.5 per loop
ctx = ssl.create_default_context(cafile=certifi.where())
geopy.geocoders.options.default_ssl_context = ctx
location_data = LocationInfo()
OUT_CAMERA = 1
INSIDE_CAMERA = 0

def get_location():
    global stop_drive
    pshellcomm = ['powershell', 'add-type -assemblyname system.device; ' \
                                '$loc = new-object system.device.location.geocoordinatewatcher;' \
                                '$loc.start(); ' \
                                'while(($loc.status -ne "Ready") -and ($loc.permission -ne "Denied")) ' \
                                '{start-sleep -milliseconds 100}; ' \
                                '$acc = %d; ' \
                                'while($loc.position.location.horizontalaccuracy -gt $acc) ' \
                                '{start-sleep -milliseconds 100; $acc = [math]::Round($acc*1.5)}; ' \
                                '$loc.position.location.latitude; ' \
                                '$loc.position.location.longitude; ' \
                                '$loc.position.location.horizontalaccuracy; ' \
                                '$loc.stop()' % accuracy]

    p = sp.Popen(pshellcomm, stdin=sp.PIPE, stdout=sp.PIPE, stderr=sp.STDOUT, text=True)
    try:
        (out, err) = p.communicate()
        out = re.split('\n', out)
        lat = float(out[0])
        long = float(out[1])
        test = Nominatim(user_agent="geoapiExercises")
        location = test.reverse(str(lat) + "," + str(long))

        if location_data.lat is None or location_data.long is None:
            location_data.lat = lat
            location_data.long = long
            location_data.location = location
            return location
        else:
            if location_data.lat != lat or location_data.long != long:
                stop_drive = False
                location_data.counter = 0
                location_data.lat = lat
                location_data.long = long
                location_data.location = location

            else:
                location_data.counter += 1
                if location_data.counter >= 4:
                    stop_drive = False
    except:
        print("failed to load a location")
        return None


def parse_location(location):
    address = location.raw['address']
    full_addr = [address.get('highway', address.get('road')), address.get('suburb', address.get('neighbourhood'))
        , address.get('town'), address.get('country', '')]
    full_addr = ','.join(str(i) for i in full_addr)
    return full_addr


def create_db(start):
    try:
        db = Db(location=start)
        return db
    except:
        print("faild to create a coonection with db")
        return None


# Initialize dlib's face detector (HOG-based) and then create the facial landmark predictor.
class DetectDriver:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=1)
        self.location_start = get_location()
        self.start_address = parse_location(self.location_start)
        self.data_base = create_db(self.start_address)
        self.count_fame_conf_phone, self.count_fame_conf_sleep, self.count_fame_conf_yawn, self.alert_yawn = self.data_base.get_configurations()

        self.detector = dlib.get_frontal_face_detector()
        self.profile_cascade = cv2.CascadeClassifier('haarcascade_profileface.xml')
        self.predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')

    def find_location(self):
        self.executor.submit(get_location)

    # Determine the facial landmarks for the face region, then convert the facial landmark (x, y)- coordinates to a NumPy array. Convert dlib's rectangle to a OpenCV-style bounding box [i.e., (x, y, w, h)], then draw the face bounding box. Loop over the (x, y)-coordinates for the facial landmarks and draw them on the image. Show the output image with the face detections + facial landmarks
    def run_detection(self):
        vid = cv2.VideoCapture(INSIDE_CAMERA)
        # frequency = 2500  # Set Frequency To 2500 Hertz
        # duration = 1000  # Set Duration To 1000 ms == 1 second
        count = count_yawn = count_sleep = count_left_side = 0
        draw_on_image = True
        while True:
            ret, image = vid.read()
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            rects = self.detector(gray, 1)
            box_left, _ = detect(gray, self.profile_cascade)
            self.find_location()
            if not stop_drive:
                if len(box_left) != 0:
                    count_left_side += 1
                    print(self.count_fame_conf_phone,"vs",count_left_side)
                    if count_left_side >= self.count_fame_conf_phone:
                        count_left_side = 0
                        frequency = 2500  # Set Frequency To 2500 Hertz
                        duration = 1000  # Set Duration To 1000 ms == 1 second
                        winsound.Beep(frequency, duration)
                        speak(volume=1, text="look straight please")
                        self.data_base.async_send(1, "phone use", location=parse_location(location_data.location))
                elif count_left_side > 1:
                    count_left_side -= 2
                if draw_on_image:
                    for (x, y, w, h) in box_left:
                        cv2.rectangle(image, (x, y), (int(w), int(h)), (0, 0, 255), 1)
                for (i, rect) in enumerate(rects):
                    shape = self.predictor(gray, rect)
                    shape = face_utils.shape_to_np(shape)
                    eye_closed = (cal_left_eye(shape) + cal_right_eye(shape)) / 2
                    Yawn = cal_yawn(shape)
                    (x, y, w, h) = face_utils.rect_to_bb(rect)
                    if draw_on_image:
                        cv2.rectangle(image, (x, y), (x + w, y + h), (255, 0, 0), 1)
                    if eye_closed >= 0.7:
                        count = count_sleep  = 0
                        # previous_output = "ALERT"
                        if draw_on_image:
                            cv2.putText(image, f"eye_closed - {eye_closed}", (x - 10, y - 10),
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)

                    elif 0.6 > eye_closed >= 0.4:
                        # if previous_output == "DROWSY":
                        #     count_drowsy += 1
                        #     # frequency = 250  # Set Frequency To 2500 Hertz
                        #     # duration = 1000  # Set Duration To 1000 ms == 1 second
                        #     # winsound.Beep(frequency, duration)
                        #     # speak("hey,dont sleep")
                        #     if draw_on_image:
                        #         cv2.putText(image, f"eye_closed{eye_closed}", (x - 10, y - 10),
                        #                     cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
                        if count >= 10:
                            count = count + 1
                            previous_output = "DROWSY alarm"
                            frequency = 2500  # Set Frequency To 2500 Hertz
                            duration = 1500  # Set Duration To 1000 ms == 1 second
                            winsound.Beep(frequency, duration)
                            speak(volume=0.5, text="you look a little bit tired")
                            if draw_on_image:
                                cv2.putText(image, f"eye_closed{eye_closed}", (x - 10, y - 10),
                                            cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
                    elif eye_closed <= 0.35:
                        count_sleep += 1
                        if count_sleep >= self.count_fame_conf_sleep:
                            count_sleep = 0
                            # previous_output = "sleep alarm"
                            frequency = 2500  # Set Frequency To 2500 Hertz
                            duration = 1500  # Set Duration To 1000 ms == 1 second
                            winsound.Beep(frequency, duration)
                            speak(volume=1, text="You are sleeping!!!")
                            # count_sleep *= 0.05
                            self.data_base.async_send(0, "sleeping", location=location_data.location[0])
                    if draw_on_image:
                        cv2.putText(image, f"eye_closed - {eye_closed}", (x - 10, y - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
                        # cv2.putText(image, "count = %d" % count, (x + w + 20, y + h + 20),
                        #             cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

                    # if Yawn < 0.8:
                    #     mouth_output = "GOOD"
                    #     cv2.putText(image, "GOOD", (x - 60, y - 60),
                    #                 cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
                    if Yawn >= 0.8:
                        mouth_output = "SLEEPY"
                        count_yawn = count_yawn + 1
                    if count_yawn >= self.count_fame_conf_yawn:
                        if self.alert_yawn:
                            frequency = 2500  # Set Frequency To 2500 Hertz
                            duration = 1000  # Set Duration To 1000 ms == 1 second
                            winsound.Beep(frequency, duration)
                            speak(volume=0.5, text="you look a little bit sleepy,maybe you need a stop")
                        # cv2.putText(image, " You are Sleepy.Please drink Water", (x - 60, y - 60),
                        #             cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
                        count_yawn = 0
                        self.data_base.async_send(2, "yawn", location=location_data.location[0])
                    # cv2.putText(image, "count_yawn = %d" % count_yawn, (x + w, y + h),
                    #             cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                    for (x, y) in shape:
                        cv2.circle(image, (x, y), 1, (0, 0, 255), -1)
            cv2.imshow("Frame", image)
            if cv2.waitKey(1) & 0xFF == ord('q'):
               break
        vid.release()
        cv2.destroyAllWindows()


if __name__ == '__main__':
    detect_driver = DetectDriver()
    detect_driver.run_detection()




""""
# # count_yawn = 0
# print(count is count_sleep)
# print(count_drowsy is count_left_side)
# # count_sleep = 0
# # count_drowsy = 0
# # count_right_side = 0
# # count_left_side = 0
# # previous_output = "ALERT"
# # mouth_output = "GOOD"

***********************************
# Initialize dlib's face detector (HOG-based) and then create the facial landmark predictor.

executor = ThreadPoolExecutor(max_workers=1)
location_start = get_location()
start_address = parse_location(location_start)
data_base = create_db(start_address)
count_fame_conf_phone, count_fame_conf_sleep, count_fame_conf_yawn, alert_yawn = data_base.get_configurations()

detector = dlib.get_frontal_face_detector()
profile_cascade = cv2.CascadeClassifier('haarcascade_profileface.xml')
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')

# Determine the facial landmarks for the face region, then convert the facial landmark (x, y)- coordinates to a NumPy array. Convert dlib's rectangle to a OpenCV-style bounding box [i.e., (x, y, w, h)], then draw the face bounding box. Loop over the (x, y)-coordinates for the facial landmarks and draw them on the image. Show the output image with the face detections + facial landmarks
vid = cv2.VideoCapture(INSIDE_CAMERA)

count = count_yawn = count_sleep = count_drowsy = count_right_side = count_left_side = 0
draw_on_image = True
stop_program = False
while not stop_program:
    ret, image = vid.read()
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    rects = detector(gray, 1)
    box_left, _ = detect(gray, profile_cascade)
    find_location()
    if not stop_drive:
        if len(box_left) != 0:
            count_left_side += 1
            if count_left_side >= count_fame_conf_phone:
                count_left_side = 0
                frequency = 2500  # Set Frequency To 2500 Hertz
                duration = 1000  # Set Duration To 1000 ms == 1 second
                winsound.Beep(frequency, duration)
                speak(volume=1, text="look straight please")
                data_base.async_send(1, "phone use", location=parse_location(location_data.location))
        elif count_left_side > 1:
            count_left_side -= 2
        if draw_on_image:
            for (x, y, w, h) in box_left:
                cv2.rectangle(image, (x, y), (int(w), int(h)), (0, 0, 255), 1)
        for (i, rect) in enumerate(rects):
            shape = predictor(gray, rect)
            shape = face_utils.shape_to_np(shape)
            eye_closed = (cal_left_eye(shape) + cal_right_eye(shape)) / 2
            Yawn = cal_yawn(shape)
            (x, y, w, h) = face_utils.rect_to_bb(rect)
            if draw_on_image:
                cv2.rectangle(image, (x, y), (x + w, y + h), (255, 0, 0), 1)
            if eye_closed >= 0.7:
                count = count_sleep = count_drowsy = 0
                previous_output = "ALERT"
                if draw_on_image:
                    cv2.putText(image, f"eye_closed{eye_closed}", (x - 10, y - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)

            elif 0.6 > eye_closed >= 0.4:
                # if previous_output == "DROWSY":
                #     count_drowsy += 1
                #     # frequency = 250  # Set Frequency To 2500 Hertz
                #     # duration = 1000  # Set Duration To 1000 ms == 1 second
                #     # winsound.Beep(frequency, duration)
                #     # speak("hey,dont sleep")
                #     if draw_on_image:
                #         cv2.putText(image, f"eye_closed{eye_closed}", (x - 10, y - 10),
                #                     cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
                if count >= 10:
                    count = count + 1
                    previous_output = "DROWSY alarm"
                    frequency = 2500  # Set Frequency To 2500 Hertz
                    duration = 1500  # Set Duration To 1000 ms == 1 second
                    winsound.Beep(frequency, duration)
                    speak(volume=0.5, text="you look a little bit tired")
                    if draw_on_image:
                        cv2.putText(image, f"eye_closed{eye_closed}", (x - 10, y - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
            elif eye_closed <= 0.35:
                count_sleep += 1
                if count_sleep >= count_fame_conf_sleep:
                    count_sleep = 0
                    # previous_output = "sleep alarm"
                    frequency = 2500  # Set Frequency To 2500 Hertz
                    duration = 1500  # Set Duration To 1000 ms == 1 second
                    winsound.Beep(frequency, duration)
                    speak(volume=1, text="You are sleeping!!!")
                    # count_sleep *= 0.05
                    data_base.async_send(0, "sleeping", location=location_data.location[0])
            if draw_on_image:
                cv2.putText(image, f"eye_closed{eye_closed}", (x - 10, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
                cv2.putText(image, "count = %d" % count, (x + w + 20, y + h + 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            # if Yawn < 0.8:
            #     mouth_output = "GOOD"
            #     cv2.putText(image, "GOOD", (x - 60, y - 60),
            #                 cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
            if Yawn >= 0.8:
                mouth_output = "SLEEPY"
                count_yawn = count_yawn + 1
            if count_yawn >= count_fame_conf_yawn:
                if alert_yawn:
                    frequency = 2500  # Set Frequency To 2500 Hertz
                    duration = 1000  # Set Duration To 1000 ms == 1 second
                    winsound.Beep(frequency, duration)
                    speak(volume=0.5, text="you look a little bit sleepy,maybe you need a stop")
                # cv2.putText(image, " You are Sleepy.Please drink Water", (x - 60, y - 60),
                #             cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
                count_yawn = 0
                data_base.async_send(2, "yawn", location=location_data.location[0])
            # cv2.putText(image, "count_yawn = %d" % count_yawn, (x + w, y + h),
            #             cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            for (x, y) in shape:
                cv2.circle(image, (x, y), 1, (0, 0, 255), -1)
    cv2.imshow("Frame", image)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        stop_program = True
vid.release()
cv2.destroyAllWindows()

"""
