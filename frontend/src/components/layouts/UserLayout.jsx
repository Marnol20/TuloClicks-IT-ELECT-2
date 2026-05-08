import { Outlet } from 'react-router-dom'
import UserViewHeader from '../user/UserViewHeader'
import '../../styles/UserView.css'

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