#!/bin/bash
git pull
npm ci
cp /home/ubuntu/.env.production.local /home/ubuntu/scale-in-backend/.env.production.local
npm run build
pm2 restart prod
