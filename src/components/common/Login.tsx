import KaKaoLogin from 'react-kakao-login';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux';
import { loginRequestAction } from '../../redux/login/reducer';

function Login() {

  const dispatch = useDispatch();
  // store 내 필터 리스트 불러오기
  const loginInfo = useSelector((store: RootState)=> store.user);
  // console.log(loginInfo);
  
  const handleLogin = (data: any) => {
    dispatch(loginRequestAction(data));
  }

  return (
    <div>
      <KaKaoLogin
        token={'0f018f7ff64a71f0976e2448a4ec8cea'}
        onSuccess={handleLogin}
        onFail={console.error}
        onLogout={console.info}
        style={{
          display: "none"
        }}
      >
        <span>Login</span>
      </KaKaoLogin>
    </div>
  )
}

export default Login;