require('dotenv').config();
const {Kafka} = require('kafkajs');

const ID = process.env.ID;
const GROUPID = process.env.GROUPID;
const KAFKA_BOOTSTRAP_SERVER1 = process.env.KAFKA_BOOTSTRAP_SERVER1;
const KAFKA_BOOTSTRAP_SERVER2 = process.env.KAFKA_BOOTSTRAP_SERVER2;
const KAFKA_BOOTSTRAP_SERVER3 = process.env.KAFKA_BOOTSTRAP_SERVER3;


const kafka = new Kafka({
    clientId: ID,
    brokers: [KAFKA_BOOTSTRAP_SERVER2],
  });

class KafkaConfig{
    constructor(){
        this.kafka = kafka;
        this.producerVar = this.kafka.producer();
        this.consumerVar = this.kafka.consumer({ groupId: GROUPID})
        this.admin = this.kafka.admin()
        this.data = [];
    }
    async producer(topic,msg){
        await this.producerVar.connect();
        await this.producerVar.send({
        topic: topic,
        messages: msg});
        await this.producerVar.disconnect();
    }
    async consumer(topic){
        await this.consumerVar.connect()
        await this.consumerVar.subscribe({ topic: topic, fromBeginning: true })
        await this.consumerVar.run({
            eachMessage: async ({ topic, partition, message }) => {
              console.log({
                value: message.value.toString(),
              })
            },
          })
        //await this.consumerVar.disconnect();
    }

}

module.exports = { KafkaConfig }