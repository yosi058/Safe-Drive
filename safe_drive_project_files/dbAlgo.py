import random

import pymongo
from pip._vendor import certifi
from pymongo import MongoClient
import time
from concurrent.futures import ThreadPoolExecutor

# db_name = "cameras"
db_name = "travels"
ID = "camera_33"
url = "mongodb+srv://any:1111@safe.bgpte.mongodb.net/safe?retryWrites=true&w=majority"
password = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
mail = "ori.kohen123@gmail.com"


class Db:
    def __init__(self, location=""):
        self.executor = ThreadPoolExecutor(max_workers=1)
        client = MongoClient(url, tlsCAFile=certifi.where())
        travels = client["travels"]
        cameraConf = client[ID]
        self.configurations = cameraConf["configurations"]
        self.travelsCamera = travels[ID]
        self.last = self.travelsCamera.find().sort('_id', -1)

        try:
            self.last = self.last[0]['_id'] + 1
        except:
            self.last = 1
            self.createDefultConfigurations(self.configurations)

        camera = client[ID]
        self.infoCamera = camera['travle_number_' + str(self.last)]
        self.createTravle(self.last, self.travelsCamera, self.infoCamera, location)

    @staticmethod
    def createDefultConfigurations(configurations):
        item = {
            "_id": ID,
            "phone": 13,
            "eyes": 3,
            "yawning": 50,
            "yawningAlert": True,
            "pass": password,
            "mail": mail
        }
        configurations.insert_one(item)

    @staticmethod
    def createTravle(last, travelsCamera, infoCamera, location):
        named_tuple = time.localtime()  # get struct_time
        time_string = time.strftime("%m/%d/%Y, %H:%M:%S", named_tuple)
        item_1 = {
            "_id": last,
            "numberOfTravel": last,
            "time": time_string,
            "status": "start",
            "locations": location
        }
        travelsCamera.insert_one(item_1)
        infoCamera.insert_one(item_1)

    def async_send(self, status, massage="", location=""):
        self.executor.submit(self.send, status, massage, location)

    def get_configurations(self):
        conf = self.configurations.find()[0]
        phone = conf["phone"]
        eyes = conf["eyes"]
        yawning = conf["yawning"]
        yawningAlert = conf["yawningAlert"]
        return phone, eyes, yawning, yawningAlert

    def send(self, status, massage="", location=""):
        named_tuple = time.localtime()  # get struct_time
        time_string = time.strftime("%m/%d/%Y, %H:%M:%S", named_tuple)

        item_1 = {
            "status": status,
            "time": time_string,
            "massage": massage,
            "locations": location
        }
        self.infoCamera.insert_one(item_1)


if __name__ == '__main__':
    length = random.randint(8, 22)
    mapStatus = {1: "phone", 0: "sleep", 2: "yawning"}
    # db = Db()
    for j in range(3):
        db = Db("ספיר, שלב א, נוף איילון, נפת רמלה,")
        for i in range(length):
            status = random.randint(0, 2)
            time.sleep(0.26)
            db.async_send(status, mapStatus[status])

    print("send")
    print("finish")

    # yawning //arr[2]
    # sleep = //arr[0]
    # phone = //arrr[1]
