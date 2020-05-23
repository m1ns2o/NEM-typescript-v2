import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import "dotenv/config";
import Log from "./modules/Log";
import DB from "./modules/MongoDB-Helper";
import SendRule from "./modules/Send-Rule";
import PassportJWTManager from "./modules/Passport-JWT-Auth";
import Router from "./router/index";
import Socket from "./socket/index";
import ProjectInitializeManager from "./modules/Project-Initialize-Manager";

const app: express.Application = express(); // 서버 객체
const port = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV;

// 테스트 코드일 시 따로 처리
if (NODE_ENV == "TEST") Log.disableConsole();
else app.use(morgan("dev")); // 서비스 시 로그 출력

app.use(cors({ origin: NODE_ENV === "development" ? "*" : process.env.REQUEST_URI || "*" })); // CORS 설정 미들웨어
app.use(helmet()); // 보안 미들웨어
app.use(compression()); // 데이터 압축 미들웨어

app.use(express.static("public")); // public 폴더의 파일을 제공함
app.use(express.urlencoded({ limit: "20mb", extended: true })); // urlencode 지원
app.use(express.json({ limit: "20mb" })); // json 지원
app.use(PassportJWTManager.getInitialize());

const server = app.listen(port, () => {
	// 서버가 열렸을 시 콜백
	Log.i(`port : ${port}`);
	if (!process.env.PORT) Log.w("Port is not set. The default port 3000.");
});

ProjectInitializeManager.checkEnv();

DB.init(); // DB 연결

app.use(Router); // 라우터 연결
app.use(SendRule.autoErrorHandler()); // 에러 핸들링

Socket.start(server);

export default app;
