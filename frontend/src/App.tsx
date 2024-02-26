import {Route, Routes} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./pages/HomePage";
import Layout from "./components/Layout";
import GamePage from "./pages/GamePage";
import ChatPage from "./pages/ChatPage";
import PersistLogin from "./components/PersistLogin";
import FriendsPage from "./pages/FriendsPage";
import TwoFAPage from "./pages/TwoFAPage";
import {SocketProvider} from "./context/SocketProvider";
import {RecoilRoot} from "recoil";
import FirstLoginPage from "./pages/FirstLoginPage";
import Require2FA from "./components/Require2FA";
import RequireFirstLogin from "./components/RequireFirstLogin";
import {TestSocketProvider} from "./context/TestSocketProvider";
import AllUsersPage from "./pages/AllUsersPage";
import UserProfilePage from "./pages/UserProfilePage";
import {UsersProvider} from "./context/UsersContext";
import AboutUsPage from "./pages/AboutUsPage";
import ErrorPage from "./pages/ErrorPage";

export function App() {
    return (
        <Routes>
            {/* public routes */}
            <Route path="/" element={<Layout/>}>
                <Route path="/auth/signup" element={<RegisterPage/>}></Route>
                <Route path="/auth/signin" element={<LoginPage/>}></Route>

                {/* protected routes */}
                <Route element={<PersistLogin/>}>
                    <Route element={<RequireFirstLogin/>}>
                        <Route
                            path="/auth/first-login"
                            element={<FirstLoginPage/>}
                        ></Route>
                    </Route>
                </Route>

                <Route element={<Require2FA/>}>
                    <Route path="/auth/2fa/42signin" element={<TwoFAPage/>}></Route>
                </Route>

                <Route element={<PersistLogin/>}>
                    <Route element={<RequireAuth/>}>
                        <Route path="/" element={<HomePage/>}></Route>
                        <Route path="/aboutus" element={<AboutUsPage/>}></Route>
                        <Route
                            path="/chat"
                            element={
                                <TestSocketProvider>
                                    <ChatPage/>
                                </TestSocketProvider>
                            }
                        ></Route>
                        <Route
                            path="/private-chats/:id"
                            element={
                                <TestSocketProvider>
                                    <ChatPage/>
                                </TestSocketProvider>
                            }
                        ></Route>
                        <Route
                            path="/game"
                            element={
                                <RecoilRoot>
                                    <SocketProvider endpointUrl={process.env.REACT_APP_SITE_URL + ":3333/pong"}>
                                        <GamePage/>
                                    </SocketProvider>
                                </RecoilRoot>
                            }
                        />
                        <Route
                            path="/game/lobby/:lobby"
                            element={
                                <RecoilRoot>
                                    <SocketProvider endpointUrl={process.env.REACT_APP_SITE_URL + ":3333/pong"}>
                                        <GamePage/>
                                    </SocketProvider>
                                </RecoilRoot>
                            }
                        />
                        <Route
                            path="/friends"
                            element={
                                <UsersProvider>
                                    <FriendsPage/>
                                </UsersProvider>
                            }
                        ></Route>
                        <Route
                            path="/users"
                            element={
                                <UsersProvider>
                                    <AllUsersPage/>
                                </UsersProvider>
                            }
                        ></Route>
                        <Route
                            path="/users/profile/:id"
                            element={
                                <UsersProvider>
                                    <UserProfilePage/>
                                </UsersProvider>
                            }
                        ></Route>
                    </Route>
                </Route>

                {/* catch all */}
                <Route path="*" element={<ErrorPage/>}></Route>
            </Route>
        </Routes>
    );
}
