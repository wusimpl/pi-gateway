#!/bin/bash

if pm2 describe pi-gateway >/dev/null 2>&1; then
  pm2 start pi-gateway
else
  pm2 start "npm run dev" --name pi-gateway
fi
