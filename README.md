
![Backend Deployment](https://github.com/aminlo/Gochat-ws/actions/workflows/cd-back.yaml/badge.svg)
![Frontend Deployment](https://github.com/aminlo/Gochat-ws/actions/workflows/cd-front.yaml/badge.svg)

# Go-chat ws

![Go](https://img.shields.io/badge/Go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white)![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=white)![React](https://img.shields.io/badge/React-%2361DAFB.svg?style=for-the-badge&logo=react&logoColor=white)![Turso](https://img.shields.io/badge/Turso-%2340C4FF.svg?style=for-the-badge&logo=turso&logoColor=white)![SQLite](https://img.shields.io/badge/SQLite-%230073A9.svg?style=for-the-badge&logo=sqlite&logoColor=white)![Firebase](https://img.shields.io/badge/Firebase-%23FFCA28.svg?style=for-the-badge&logo=firebase&logoColor=white)![Docker](https://img.shields.io/badge/Docker-%2300BFFF.svg?style=for-the-badge&logo=docker&logoColor=white)![Google Cloud](https://img.shields.io/badge/Google%20Cloud-%23007ACC.svg?style=for-the-badge&logo=googlecloud&logoColor=white)![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)![CI/CD](https://img.shields.io/badge/CI/CD-%2300BFFF.svg?style=for-the-badge&logo=github&logoColor=white)

Link: https://gochat-proj.web.app/

Note: *The backend automatically refreshes room memory states when there is no activity for a certain period, helping to save hosting credits. As a result, there may not be any available rooms to join immediately unless new ones are created. (User data is not affected, as it is persistently stored in the database.)*

***Best user experience on light mode, not configured for dark mode***


## Description
This repository is a self-made project made to aid and build my skills and knowledge, while also showing my capability. Not fully completed, due to time and life. However satisfied with my effort and work put in, and the knowledge I've learnt.

**Go-chat** is a real-time chat application that allows users to chat with one another, whether with peers or strangers online! It allows users to create, join, and manage chat rooms, supporting both authenticated and anonymous messaging.

## Features

- Real-time chat via WebSockets
- User authentication (signup, login)
- Create, update, and delete chat rooms
- Automatic **CI/CD** implemented for both back-end (**Google Cloud Run Deployment**) and front-end (**Firebase**)
- Manage own rooms and view active users
- **Anonymous** and **authenticated** chat support
- **REST API** endpoints for room management
- Frontend built with **React** & **Vite**

## Project Structure

- `backend/websock/`: Go backend server, WebSocket and REST API logic
- `frontend/websock/gochat-front/`: React frontend client

## Future improvements, tweaks
- Log-out function, can be implemented by clearing the authentication cookie via a logout API endpoint
- Actions on users, such as mute or ban. Can be done by adding more endpoints to allow for such features. Actions and logs can be saved in the database with additional tables, referencing ID of room as the Primary Key.
- Complete Edit room functionality, being able to change banner etc. Could be added to chat room as well through Google Buckets.
