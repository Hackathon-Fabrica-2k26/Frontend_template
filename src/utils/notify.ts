import { toast } from 'vue3-toastify'

export const notify = {
  success: (message: string) => toast.success(message, { position: 'top-right', autoClose: 3000 }),
  error: (message: string) => toast.error(message, { position: 'top-right', autoClose: 5000 }),
}
