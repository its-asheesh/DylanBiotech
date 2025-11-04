import { AuthCardLayout } from '@/components/auth/AuthCardLayout'
import { MobileLoginFirebase } from '@/components/auth/MobileLoginFirebase'
import { PhoneAndroidTwoTone } from '@mui/icons-material'

function MobileAuth() {
  return (
    <>
    <AuthCardLayout
    title='Mobile Authentication'
    subtitle='Enter your mobile number to continue'
    icon = {<PhoneAndroidTwoTone/>}
    >
        <MobileLoginFirebase/>
    </AuthCardLayout>
    </>
  )
}

export default MobileAuth
