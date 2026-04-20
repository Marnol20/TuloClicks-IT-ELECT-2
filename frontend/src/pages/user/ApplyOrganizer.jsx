import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Login.css'
import api from '../../services/api'

function ApplyOrganizer() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [organizationName, setOrganizationName] = useState('')
  const [organizationType, setOrganizationType] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [facebookLink, setFacebookLink] = useState('')
  const [instagramLink, setInstagramLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!organizationName) {
      addToast('Organization name is required', 'warning')
      return
    }

    try {
      setLoading(true)

      await api.post('/organizers/apply', {
        organization_name: organizationName,
        organization_type: organizationType,
        description,
        website,
        facebook_link: facebookLink,
        instagram_link: instagramLink
      })

      setError('')
      setSubmitted(true)
      addToast('Application submitted successfully!', 'success')
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to submit application'
      setError(errorMsg)
      addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

   return (
     <div className="login-page">
       <div className="login-container" style={{ maxWidth: '560px' }}>
         {!submitted ? (
           <>
             <h2>Apply as Organizer</h2>
             <p>Submit your organization details for admin approval</p>

             <form className="login-form" onSubmit={handleSubmit}>
               <div className="form-group">
                 <label>Organization Name</label>
                 <input
                   type="text"
                   placeholder="Enter organization name"
                   value={organizationName}
                   onChange={(e) => setOrganizationName(e.target.value)}
                 />
               </div>

               <div className="form-group">
                 <label>Organization Type</label>
                 <input
                   type="text"
                   placeholder="Company, School Org, Community Group, etc."
                   value={organizationType}
                   onChange={(e) => setOrganizationType(e.target.value)}
                 />
               </div>

               <div className="form-group">
                 <label>Description</label>
                 <input
                   type="text"
                   placeholder="Short description of your organization"
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                 />
               </div>

               <div className="form-group">
                 <label>Website</label>
                 <input
                   type="text"
                   placeholder="https://..."
                   value={website}
                   onChange={(e) => setWebsite(e.target.value)}
                 />
               </div>

               <div className="form-group">
                 <label>Facebook Link</label>
                 <input
                   type="text"
                   placeholder="Facebook page link"
                   value={facebookLink}
                   onChange={(e) => setFacebookLink(e.target.value)}
                 />
               </div>

               <div className="form-group">
                 <label>Instagram Link</label>
                 <input
                   type="text"
                   placeholder="Instagram profile link"
                   value={instagramLink}
                   onChange={(e) => setInstagramLink(e.target.value)}
                 />
               </div>

               <button type="submit" className="login-submit-btn" disabled={loading}>
                 {loading ? 'Submitting...' : 'Submit Application'}
               </button>
             </form>
           </>
         ) : (
           <div className="apply-organizer-success" style={{ textAlign: 'center', padding: '40px 20px' }}>
             <h2 style={{ marginBottom: '16px', fontSize: '28px', fontWeight: '700', color: '#22c55e' }}>
               Organizer Application Submitted
             </h2>
             <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
               Your organizer application has been submitted and is pending admin review.
             </p>
             <button
               type="button"
               className="login-submit-btn"
               onClick={() => navigate('/home')}
               style={{ marginTop: '24px' }}
             >
               Back to Home
             </button>
           </div>
         )}
       </div>
     </div>
   )
}

export default ApplyOrganizer