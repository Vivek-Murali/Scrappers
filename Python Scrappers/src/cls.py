""" from kafka import KafkaProducer
from kafka import KafkaConsumer


#producer = KafkaProducer(bootstrap_servers='10.110.115.10:9092')
#producer.send('test_topic', b'Hello, World!')
consumer = KafkaConsumer('test_topic', '10.110.115.10:9092')
for message in consumer:
    print (message) """

import json
from time import sleep

from kafka import KafkaConsumer

if __name__ == '__main__':
    parsed_topic_name = 'test_topic'
    # Notify if a recipe has more than 200 calories
    calories_threshold = 200

    consumer = KafkaConsumer(parsed_topic_name, auto_offset_reset='earliest',
                             bootstrap_servers=['10.110.115.10:9092'], api_version=(0, 10), consumer_timeout_ms=1000)
    for msg in consumer:
        record = json.loads(msg.value)
        print(record)
        """ calories = int(record['calories'])
        title = record['title']

        if calories > calories_threshold:
            print('Alert: {} calories count is {}'.format(title, calories))
        sleep(3) """

    if consumer is not None:
        consumer.close()