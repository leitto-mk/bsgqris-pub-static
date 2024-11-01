#!/usr/bin/sh

docker build -t container.banksulutgo.co.id:5000/qris-merchant-pub .

docker push container.banksulutgo.co.id:5000/qris-merchant-pub
