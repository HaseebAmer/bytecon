import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css';
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MainPage from './pages/Main';
import Profile from './pages/Profile'
import NewPasswordPage from './pages/NewPassword';
import ForgotPasswordEmail from './pages/ForgotPasswordEmail';
import ResetPassword from './pages/ResetPassword'
import CreateEventPage from './pages/CreateEventPage'
import EventDetailPage from './pages/EventDetailPage';
import Calendar from './pages/Calendar';
import MyEvents from './pages/MyEvents';
import EditEvent from './pages/EditEvent';
import ProtectedRoutes from './ProtectedRoutes';
export default function App() {
  return (
    <div>
        <BrowserRouter>
            <Routes>
                <Route index element={<Home />} />
                <Route path='/home' element={<Home />} />
                <Route path="/reset_password" element={<ResetPassword />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/forgot-password-enter-email' element={<ForgotPasswordEmail/>}/>
                <Route path='/new-password' element={<NewPasswordPage />}/>

                <Route element={<ProtectedRoutes/>}>
                  <Route path='/main' element={<MainPage />}/>
                  <Route path='/profile' element={<Profile />}/>
                  <Route path='/new-event' element={<CreateEventPage />}/>
                  <Route path="/event/:title" element={<EventDetailPage />} />
                  <Route path='/calendar' element={<Calendar />}/>
                  <Route path='/my-events' element={<MyEvents />}/>
                  <Route path='/edit-event/:title' element={<EditEvent />}/>
                </Route>
            </Routes>
        </BrowserRouter>
    </div>
  );
}

