# 오늘의 운세 앱

생년월일과 성별을 입력하면 Gemini(사주)와 Nova(별자리) AI가 오늘의 운세를 알려주는 앱입니다.

## 사용한 AWS 리소스

- **S3**: 정적 웹사이트 호스팅 (React 빌드 파일)
- **Lambda x2**: Gemini API 호출 (사주), Amazon Bedrock Nova 호출 (별자리)
- **RDS (MySQL)**: 운세 조회 기록 저장
- **EC2 (Cloud9)**: 개발 환경 (앱 동작에는 미사용)

## 실행 방법

배포 URL: http://kmucloud-03-s3.s3-website-us-east-1.amazonaws.com/

1. 생년월일 입력 (예: 1995-03-15)
2. 성별 선택
3. 태어난 시간 입력 (선택)
4. Gemini 사주 운세 또는 Nova 별자리 운세 버튼 클릭

## 환경변수 설정

`server/.env` 파일을 직접 생성해야 합니다.

```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
GEMINI_LAMBDA_URL=
BEDROCK_LAMBDA_URL=
```
