const whatsapp = new Whatsapp({
    accessToken: process.env.FACEBOOK_SYSTEM_ACCESS_TOKEN as string,
    phoneNumberId: Number(req.query.phoneNumberId),
    apiVersion: 'v17.0', // Meta API 버전 지정
    debug: true, // 디버깅을 위해 활성화
});
