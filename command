MongoDB Connection
/etc/init.d/mongodb start
---------------------------------------------------------------------------
./logstash -e 'input { stdin{} } output { stdout {}}'
//to execute config file location
./logstash -f /home/asad/ELK-Stack/data/{which_config_file}
---------------------------------------------------------------------------

To Check index count=>
http://localhost:9200/vehicles/_count
http://localhost:9200/purchase/_count
http://localhost:9200/useraccount/_count
http://localhost:9200/logstash-2020.10.10-000001/_count
or
http://localhost:9200/logstash-*/_count

--------------------------------------------------------------------------
sudo service filebeat start
http://localhost:5601/app/home#/tutorial/apacheLogs

https://tecadmin.net/install-apache-kafka-ubuntu/ 
"java" location is mandatory
--------------------------------------------------------------------------
https://www.digitalocean.com/community/tutorials/how-to-install-apache-kafka-on-ubuntu-18-04
sudo systemctl enable kafka
systemctl daemon-reload
sudo systemctl start kafka
sudo systemctl status kafka

bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic testTopic

sudo ./kafka-console-producer.sh --broker-list localhost:9092 --topic testTopic
---------------------------------------------------------------------------------------------