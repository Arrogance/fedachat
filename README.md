# fedachat

> Feda.chat Videostream Chat.

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

## Nginx reverse proxy rules for wss://
```
location /socket.io {
	proxy_pass http://127.0.0.1:32771/socket.io;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header Host $host;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_http_version 1.1;
	proxy_set_header Upgrade $http_upgrade;
	proxy_set_header Connection "upgrade";
}
```

## Apache reverse proxy rules
```apacheconfig
# HTTP
RewriteEngine on
RewriteCond %{HTTPS} !=on
RewriteRule ^/?(.*)$ https://%{SERVER_NAME}/$1 [R,L]

RewriteCond %{WSS} !=on
RewriteRule ^/socket.io/?(.*)$ ws://%{SERVER_NAME}/socket.io/$1 [R,L]

Header add Access-Control-Allow-Origin "*"

# HTTPS
RewriteEngine on
RewriteRule "^$" "/" [R,L]
SSLProxyEngine on
ProxyRequests off
Header add Access-Control-Allow-Origin "*"
<Location "/">
	RequestHeader set X-Forwarded-Proto 'https'

	ProxyPreserveHost On
	ProxyPass http://127.0.0.1:32771/
	ProxyPassReverse http://127.0.0.1:32771/
	Header add Access-Control-Allow-Origin "*"
</Location>

<Location "/socket.io">
	RequestHeader set X-Forwarded-Proto 'https'

	ProxyPreserveHost On
	ProxyPass http://127.0.0.1:32771/socket.io
	ProxyPassReverse http://127.0.0.1:32771/socket.io
	Header add Access-Control-Allow-Origin "*"
</Location>
```
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
