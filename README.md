zoom 클론 개발 실습

# 환경설정

# zoom 폴더만들기

zoom폴더에서

npm init -y

# pakage.json 파일을 열고

main, scripts, 삭제
keywords, license 사용안할거면 삭제

# README.md 파일 생성

git 방문자를 위한 간단한 메세지 작성

# npm i nodemon -D    (코드내용 실시간 반영)

# babel.config.json 생성

(타입스크립트, 신규js버전 업데이트를 구버전 웹브라우저에서도 볼수 있게 js 컴파일)

{
    "presets":["@babel/preset-env"]
}

# src폴더 생성

src폴더내 server.js 생성

cosole.log("hello")

# nodemon.json 생성

{
    "exec" :"babel-node src/server.js"
}

#git init . 저장소 신규생성

# npm i @babel/core @babel/cli @babel/node @babel/preset-env -D 설치 진행

# .gitignore 생성 후

/node_modules

# package.json 파일열고 작성

"scripts" : { "dev": "nodemon"},

#npm i express 설치 (node 웹제작 프레임워크)

#sever.js 파일열고
import express from "express"; 추가

#pug 설치 (html 템플릿 - 태그 작성없이 html 작성가능)
npm i pug

#모든 준비가 끝나면
npm run dev를 실행

서버서비스가 시작되고 localhost:3000 포트에서 접속

- 클라이언트서비스 설정-

# src 폴더내에 public, views 폴더 생성

src폴더내 js폴더 생성 후 app.js 파일 생성

# views 폴더내 home.pug 생성 후

html 코드 상용구 입력하여 내용추가
script(src="/public/js/app.js") 추가

# server.js 파일에 내용 추가

app.set("view engine", "pug")
app.set("views", __dirname+"/views")
app.use("/public", express.static(__dirname + "/public"))
app.get(("/"), (req, res) => res.render("home"))
const handlelisten = () => console.log("Service started. Listening on http://localhost:3000")
app.listen(3000, handlelisten)

# 작업해도 서버가 새로고침하지 않는 폴더지정

nodemon.json에 다음내용추가
"ignore":["src/public/*"],

# 웹소켓 통신을 위해 ws 다운로드

npm i ws
