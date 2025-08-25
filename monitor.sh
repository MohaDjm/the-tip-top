#!/bin/bash
echo "=== MONITORING THÉ TIP TOP ==="
echo "PM2 Status:" && pm2 status
echo -e "\nPorts:" && sudo netstat -tlnp | grep -E ':(80|3001|3002)'
echo -e "\nBackend:" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/health
echo -e "\nFrontend:" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3001  
echo -e "\nPublic:" && curl -s -o /dev/null -w "%{http_code}" http://164.68.103.88/health
echo -e "\nAPI Public:" && curl -s -o /dev/null -w "%{http_code}" http://164.68.103.88/api/health
