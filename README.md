# Ninnin TCG Manager

Pokémon / One Piece 중심의 개인용 TCG 포트폴리오 웹앱입니다.

## v1 기능

- 카드 등록 / 수정 / 삭제
- 카드 이미지 저장
- PC / Core Hold / Trade / Grading 목적 관리
- RAW / PSA / BRG 관리
- 매입가, 부대비용, 현재시세, 평가손익 자동 계산
- 매입 / 매도 / 수수료 / 배송비 기반 순현금흐름
- PSA / BRG 그레이딩 비용 및 ROI
- Dashboard
- 검색 / 필터
- IndexedDB 로컬 저장
- JSON 전체 백업 / 복원
- PC / 모바일 반응형 UI

## 실행

빌드 과정이 없습니다. `index.html`을 웹 서버로 열면 됩니다.

로컬에서는 저장소 폴더에서 다음처럼 실행할 수 있습니다.

```bash
python -m http.server 8000
```

브라우저에서 `http://localhost:8000` 접속.

## GitHub Pages

Repository → Settings → Pages → Build and deployment에서

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

를 선택하고 저장하면 정적 웹앱으로 사용할 수 있습니다.

> 데이터는 각 브라우저의 IndexedDB에 저장됩니다. PC와 휴대폰 데이터는 자동 동기화되지 않습니다. Backup 메뉴에서 JSON 백업을 정기적으로 내려받으세요.

## 향후 후보

- 카드 상세 화면 / 시세 History
- Grading EV 계산
- 캐릭터 / 언어 / 세트별 분석
- 카드별 투자 점수
- Supabase 기반 계정 / PC·모바일 동기화
- 외부 시세 / POP 데이터 연동
