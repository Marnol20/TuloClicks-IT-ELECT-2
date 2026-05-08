import { Outlet } from 'react-router-dom'
import MainHeader from '../common/MainHeader'
import '../../styles/UserView.css'

function OrganizerLayout() {
  return (
    <div className="user-view">
      <MainHeader />
      <main className="user-view-content">
        <Outlet />
      </main>
    </div>
  )
}

export default OrganizerLayout