import { Button, Stack } from "@mui/material"
import { useSettings } from "../auth/TactnaAuthProvider"
import { buildSignupUrl, originOf } from "../utils"

// Entry points into MyAccount. The UUIDs are examples from one demo tenant —
// replace them with your own app / embedded-UI ids.
export const Links = () => {
    const { signupEndpoint, clientId, postSignupRedirectUri } = useSettings();
    const myAccountOrigin = originOf(signupEndpoint);
    const open = (path: string) => {
        window.location.href = `${myAccountOrigin}/${path}`;
    };

    if (!myAccountOrigin) {
        return <p>Set VITE_SIGNUP_ENDPOINT to use these links.</p>;
    }

    return (
        <Stack spacing={2}>
            <Button onClick={() => { window.location.href = buildSignupUrl(signupEndpoint, clientId, postSignupRedirectUri); }}>サインアップ</Button>
            <Button onClick={() => open("eui/874d0a78-b42a-4d22-8f58-ee05ca589650")}>利用状況照会</Button>
            <Button onClick={() => open("profile")}>登録情報確認・変更 / 自身のユーザーの情報</Button>
            <Button onClick={() => open("settings")}>登録情報確認・変更 / チーム全体の情報</Button>
            <Button onClick={() => open("applications/226b3e2e-8a50-4ef9-843d-3bf387e1fc80/settings")}>プラン変更（遷移後、「Manage」ボタンを押す）</Button>
            <Button onClick={() => open("billing")}>追加容量購入しようとしてカードが通らなかった場合</Button>
            <Button onClick={() => open("billing/add-payment-method")}>ログイン後に支払い方法が未設定の場合</Button>
            <Button onClick={() => open("settings")}>退会（遷移後、「チーム削除」ボタンを押す）</Button>
        </Stack>
    )
}
