import { Button, Stack } from "@mui/material"
import { appConfig } from "../config"

export const Links = () => {
    const onClickSignup = () => {
        window.location.href = `${appConfig.signupEndpoint}?client_id=${appConfig.clientId}&redirect_uri=${appConfig.postSignupRedirectUri}`;
    }

    const myaccountUrl = appConfig.signupEndpoint.replace("/signup/start", "");

    const redirect = (path: string) => {
        const redirectUrl = `${myaccountUrl}/${path}`;
        window.location.href = redirectUrl;
    }

    return (
        <Stack spacing={2}>
            <Button onClick={onClickSignup}>サインアップ</Button>
            <Button onClick={() => redirect("eui/874d0a78-b42a-4d22-8f58-ee05ca589650")}>利用状況照会</Button>
            <Button onClick={() => redirect("profile")}>登録情報確認・変更 / 自身のユーザーの情報</Button>
            <Button onClick={() => redirect("settings")}>登録情報確認・変更 / チーム全体の情報</Button>
            <Button onClick={() => redirect("applications/226b3e2e-8a50-4ef9-843d-3bf387e1fc80/settings")}>プラン変更（遷移後、「Manage」ボタンを押す）</Button>
            <Button onClick={() => redirect("billing")}>追加容量購入しようとしてカードが通らなかった場合</Button>
            <Button onClick={() => redirect("billing/add-payment-method")}>ログイン後に支払い方法が未設定の場合</Button>
            <Button onClick={() => redirect("settings")}>退会（遷移後、「チーム削除」ボタンを押す）</Button>
        </Stack>
    )
}