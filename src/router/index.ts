import {createRouter, createWebHistory} from 'vue-router'

declare module 'vue-router' {
    interface RouteMeta {
        title?: string
    }
}

const routes = [
    {
        path: '/task',
        component: () => import('../layouts/AdminLayout.vue'),
        redirect: '/task/job',
        children: [
            {
                path: 'job',
                name: 'TaskJobList',
                component: () => import('../views/task/JobList.vue'),
                meta: {title: '任务管理'},
            },
            {
                path: 'job/detail',
                name: 'TaskJobDetail',
                component: () => import('../views/task/JobDetail.vue'),
                meta: {title: '任务详情'},
            },
            {
                path: 'log',
                name: 'TaskJobLogList',
                component: () => import('../views/task/JobLogList.vue'),
                meta: {title: '执行日志'},
            },
            {
                path: 'log/detail/:id',
                name: 'TaskJobLogDetail',
                component: () => import('../views/task/JobLogDetail.vue'),
                meta: {title: '日志详情'},
            },
        ],
    },
    {
        path: '/',
        redirect: '/task/job',
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
