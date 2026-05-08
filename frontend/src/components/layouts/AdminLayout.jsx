import { Outlet } from 'react-router-dom'
import MainHeader from '../common/MainHeader'
import '../../styles/UserView.css'

function AdminLayout() {
  return (
    <div className="user-view">
      <MainHeader />
      <main className="user-view-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout