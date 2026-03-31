import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/views/login.vue'
import Dashboard from '../components/views/dashboard.vue'
import page from '../components/views/page.vue'
// import StudentDashboard from '../components/views/student/Dashboard.vue'
// import TeacherDashboard from '../components/views/teacher/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: Login, meta: {  guestOnly: true } },
    { path: '/student', name: 'student-login', component: Login, meta: { role: 'student', guestOnly: true } },
    { path: '/teacher', name: 'teacher-login', component: Login, meta: { role: 'teacher', guestOnly: true } },

    {
      path: '/dashboard',
      name: 'page',
      component: page,
      meta: { requiresAuth: true }
    },
    

  ]
})

router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  }
  else {
    next()
  }
})


export default router
