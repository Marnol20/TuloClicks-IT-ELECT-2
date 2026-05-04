import { Outlet } from 'react-router-dom'
import UserViewHeader from '../user/UserViewHeader'
import '../../styles/UserView.css'

<<<<<<< HEAD
=======

>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
function UserLayout() {
  return (
    <div className="user-view">
      <UserViewHeader />
      <main className="user-view-content">
        <Outlet />
      </main>
    </div>
  )
}

export default UserLayout