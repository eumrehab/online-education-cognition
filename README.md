# 인지활동지도사 온라인 교육원

독립 프로젝트 이름: `online-education-cognition`

기존 교육원의 화면 구성과 수강생 로그인, 진도 저장·이어보기, 8개 강의, 수강 완료 후 60분 시험, 기관 관리자 진도 조회 기능을 이어받은 새 과정입니다.

## 현재 상태

- 모든 사이트 명칭을 인지활동지도사로 변경했습니다.
- 기존 강의 영상·시험 문제·문항 이미지는 포함하지 않았습니다.
- 8개 강의명은 준비 중으로 표시합니다. 신규 자료가 확정되면 변경합니다.
- 운영 중인 기존 사이트의 Git 이력·배포·구글 시트 연결은 가져오지 않았습니다.
- `app.js`의 `resultsEndpoint`와 `google-apps-script.gs`의 `SPREADSHEET_ID`는 인지활동지도사 전용 새 웹앱·관리대장으로 연결했습니다. 수강생 명단에서 상태가 `사용`인 학번·이름만 로그인할 수 있습니다.
- 브라우저 저장 키와 인증 응답 식별자는 인지활동지도사 전용으로 분리했습니다.
- 시험 문제를 등록하기 전에는 시험 응시·빈 답안 제출을 막습니다.

## 로컬 확인

이 폴더에서 `node server.js` 실행 후 http://127.0.0.1:8081 접속.
기존 사이트의 기본 포트 8080과 분리했습니다.

## 별도 운영 설정

1. 새 저장소: https://github.com/eumrehab/online-education-cognition — 기존 `online-education` 저장소의 주소나 설정은 변경하지 않습니다.
2. 새 관리대장: https://docs.google.com/spreadsheets/d/1s6XR3np6P_IQiJNm508K8llosgSXiInKU8hpQaIrYl8/edit
3. 새 Apps Script: https://script.google.com/home/projects/1Wuhec5_IqebuoODr2z-fDcKvbewhpV8PJdGUfdom-DrPdXNZP33UXaYn/edit — 웹앱 실행 사용자는 소유자, 접근 범위는 모든 사용자입니다. 시트를 공개할 필요는 없습니다. 수강생·기관 관리자 등록 방법은 스크립트 내 설정 함수를 사용합니다.
4. `index.html`의 강의 시간표와 `app.js`의 `CONFIG.lessons`에 실제 강의명·설명·신규 영상 주소를 입력합니다.
5. `exam-questions.js`에 신규 과정 시험 문항을, 새 시트의 `시험 정답` 탭에 정답을 등록합니다.
6. 홈페이지: https://eumrehab.github.io/online-education-cognition/ — 새 저장소에서만 별도로 배포됩니다.

실제 로그인·진도 저장·채점·관리자 조회의 통합 검증은 신규 전용 연동을 설정한 뒤 진행해야 합니다.
