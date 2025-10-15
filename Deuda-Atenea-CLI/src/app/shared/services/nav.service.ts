import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

//Menu Bar
export interface Menu {
    headTitle?: string,
    path?: string;
    title?: string;
    icon?: string;
    type?: string;
    badgeType?: string;
    badgeValue?: string;
    active?: boolean;
    bookmark?: boolean;
    children?: Menu[];
}

@Injectable({
    providedIn: 'root'
})

export class NavService implements OnDestroy {

    private unsubscriber: Subject<any> = new Subject();
    public screenWidth: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth);

    public megaMenu: boolean = false;
    public megaMenuCollapse: boolean = window.innerWidth < 1199 ? true : false;
    public collapseSidebar: boolean = window.innerWidth < 991 ? true : false;
    public fullScreen: boolean = false;
    constructor(
        private router: Router
    ) {
        this.setScreenWidth(window.innerWidth);
        fromEvent(window, 'resize').pipe(
            debounceTime(1000),
            takeUntil(this.unsubscriber)
        ).subscribe((evt: any) => {
            this.setScreenWidth(evt.target.innerWidth);
            if (evt.target.innerWidth < 991) {
                this.collapseSidebar = false;
                this.megaMenu = false;
            }
            if (evt.target.innerWidth < 1199) {
                this.megaMenuCollapse = true;
            }
        });
        if (window.innerWidth < 991) {
            this.router.events.subscribe(event => {
                this.collapseSidebar = false;
                this.megaMenu = false;
            });
        }
    }


    ngOnDestroy() {
        this.unsubscriber.next();
        this.unsubscriber.complete();
    }
    
    private setScreenWidth(width: number): void {
        this.screenWidth.next(width);
    }
    
    MENUITEMS: Menu[] = [
        
        {
            title: 'Dashboard', icon: 'home', type: 'sub', active: false,
            children: [
                { path: '/ventasMolienda', title: 'ventasMolienda', type: 'link' },
                { path: '/libroFisico', title: 'libroFisico', type: 'link' },
                { path: '/dashboard/dashboard03', title: 'Dashboard03', type: 'link' },
                { path: '/dashboard/dashboard04', title: 'Dashboard04', type: 'link' },
                { path: '/dashboard/detallePrecios', title: 'detallePrecios', type: 'link' }
            ]
        },
        
        {
            title: 'Apps', icon: 'layers', type: 'sub', active: false,
            children: [
                {
                    title: 'Chat', type: 'sub', active: false,
                    children: [
                        { path: '/apps/chat/chat01', title: 'Chat 01', type: 'link' },
                        { path: '/apps/chat/chat02', title: 'Chat 02', type: 'link' },
                        { path: '/apps/chat/chat03', title: 'Chat 03', type: 'link' },
                    ]
                },
                {
                    title: 'Contact', type: 'sub', active: false,
                    children: [
                        { path: '/apps/contact/contact01', title: 'Contact List 01', type: 'link' },
                        { path: '/apps/contact/contact02', title: 'Contact List 02', type: 'link' }
                    ]
                },
                {
                    title: 'File manager', type: 'sub', active: false,
                    children: [
                        { path: '/apps/filemanager/filemanager01', title: 'File Manager 01', type: 'link' },
                        { path: '/apps/filemanager/filemanager02', title: 'File Manager 02', type: 'link' },
                    ]
                },
                {
                    title: 'Todo List', type: 'sub', active: false,
                    children: [
                        { path: '/apps/todolist/todolist01', title: 'Todo List 01', type: 'link' },
                        { path: '/apps/todolist/todolist02', title: 'Todo List 02', type: 'link' },
                        { path: '/apps/todolist/todolist03', title: 'Todo List 03', type: 'link' },
                    ]
                },
                {
                    title: 'User List', type: 'sub', active: false,
                    children: [
                        { path: '/apps/userlist/userlist01', title: 'User List 01', type: 'link' },
                        { path: '/apps/userlist/userlist02', title: 'User List 02', type: 'link' },
                        { path: '/apps/userlist/userlist03', title: 'User List 03', type: 'link' },
                        { path: '/apps/userlist/userlist04', title: 'User List 04', type: 'link' }
                    ]
                },
                { path: '/apps/calendar', title: 'Calendar', type: 'link' },
                { path: '/apps/dragula-card', title: 'Dragula Card', type: 'link' },
                { path: '/apps/image-crop', title: 'Image Crop', type: 'link' },
                { path: '/apps/page-sessiontimeout', title: 'Page-session timeout', type: 'link' },
                { path: '/apps/notifications', title: 'Notifications', type: 'link' },
                { path: '/apps/sweet-alerts', title: 'Sweet alerts', type: 'link' },
                { path: '/apps/range-slider', title: 'Range slider', type: 'link' },
                { path: '/apps/counters', title: 'Counters', type: 'link' },
                { path: '/apps/loaders', title: 'Loaders', type: 'link' },
                { path: '/apps/time-line', title: 'Time Line', type: 'link' },
                { path: '/apps/rating', title: 'Rating', type: 'link' },
                
            ]
        },

        {
            title: 'Firebase', icon: 'zap', type: 'sub', active: false,
            children: [
                { path: '/firebase/crud/register-member', title: 'CRUD', type: 'link' },
                { path: '/firebase/task-list', title: 'Task', type: 'link' },
            ]
        },
        {
            title: 'Widgets', icon: 'box', type: 'sub', active: false,
            children: [
                { path: '/widgets/widgets', title: 'Widgets', type: 'link' },
                { path: '/widgets/chart-widgets', title: 'Chart Widgets', type: 'link' }
            ]
        },

        {
            title: 'Forms', icon: 'edit', type: 'sub', badgeType: 'success', badgeValue: '6', active: false,
            children: [
                { path: '/forms/form-elements', title: 'Form Elements', type: 'link' },
                { path: '/forms/advanced-forms', title: 'Advanced Forms', type: 'link' },
                { path: '/forms/form-wizard', title: 'Form Wizard', type: 'link' },
                { path: '/forms/form-edit', title: 'Form Editor', type: 'link' },
                { path: '/forms/form-element-sizes', title: 'Form Element Sizes', type: 'link' },
                { path: '/forms/form-treeview', title: 'Form Treeview', type: 'link' },
            ]
        },
        {
            title: 'Charts', icon: 'pie-chart', type: 'sub', badgeType: 'info', badgeValue: '5', active: false,
            children: [
                { path: '/charts/apex', title: 'Apex Charts', type: 'link' },
                { path: '/charts/chartjs', title: 'Chart.js Charts', type: 'link' },
                { path: '/charts/echarts', title: 'Echart Charts', type: 'link' },
                { path: '/charts/chart-list', title: 'Chartlist Charts', type: 'link' }
            ]
        },
        {
            title: 'Maps', icon: 'map', type: 'sub', active: false,
            children: [
                { path: '/maps/leaflet', title: 'Leaflet Maps', type: 'link' },
            ]
        },
        {
            title: 'Tables', icon: 'layout', type: 'sub', active: false,
            children: [
                { path: '/tables/default-tables', title: 'Default Table', type: 'link' },
                { path: '/tables/data-tables', title: 'Data Table', type: 'link' }
            ]
        },
        {
            title: 'Elements', icon: 'sliders', type: 'sub', active: false,
            children: [
                { path: '/elements/accordion', title: 'Accordion', type: 'link' },
                { path: '/elements/alerts', title: 'Alerts', type: 'link' },
                { path: '/elements/avatars', title: 'Avatars', type: 'link' },
                { path: '/elements/badges', title: 'Badges', type: 'link' },
                { path: '/elements/bread-crumbs', title: 'Breadcrumb', type: 'link' },
                { path: '/elements/buttons', title: 'Buttons', type: 'link' },
                { path: '/elements/cards', title: 'Cards', type: 'link' },
                { path: '/elements/card-images', title: 'Card Images', type: 'link' },
                { path: '/elements/carousel', title: 'Carousel', type: 'link' },
                { path: '/elements/dropdown', title: 'Dropdown', type: 'link' },
                { path: '/elements/footers', title: 'Footers', type: 'link' },
                { path: '/elements/headers', title: 'Headers', type: 'link' },
                { path: '/elements/list', title: 'List', type: 'link' },
                { path: '/elements/media-object', title: 'Media Object', type: 'link' },
                { path: '/elements/modal', title: 'Modal', type: 'link' },
                { path: '/elements/navigation', title: 'Navigation', type: 'link' },
                { path: '/elements/pagination', title: 'Pagination', type: 'link' },
                { path: '/elements/panels', title: 'Panel', type: 'link' },
                { path: '/elements/popover', title: 'Popover', type: 'link' },
                { path: '/elements/progress', title: 'Progress', type: 'link' },
                { path: '/elements/tabs', title: 'Tabs', type: 'link' },
                { path: '/elements/tags', title: 'Tags', type: 'link' },
                { path: '/elements/tooltips', title: 'Tooltips', type: 'link' },

            ]
        },
        {
            title: 'Icons', icon: 'droplet', type: 'sub', badgeType: 'warning', badgeValue: '11', active: false,
            children: [
                { path: '/icons/font-awesome', title: 'Font Awesome Icons', type: 'link' },
                { path: '/icons/material-design', title: 'Material Design Icons', type: 'link' },
                { path: '/icons/simple-line', title: 'Simple Line Icons', type: 'link' },
                { path: '/icons/feather', title: 'Feather Icons', type: 'link' },
                { path: '/icons/ionic', title: 'Ionic Icons', type: 'link' },
                { path: '/icons/flag', title: 'Flag Icons', type: 'link' },
                { path: '/icons/pe7', title: 'pe7 Icons', type: 'link' },
                { path: '/icons/themify', title: 'Themify Icons', type: 'link' },
                { path: '/icons/typicons', title: 'Typicons Icons', type: 'link' },
                { path: '/icons/weather', title: 'Weather Icons', type: 'link' },
                { path: '/icons/material', title: 'Material Icons', type: 'link' },
            ]
        },
        {
            title: 'Pages', icon: 'file', type: 'sub', active: false,
            children: [
                {
                    title: 'Profile', type: 'sub', active: false,
                    children: [
                        { path: '/pages/profile/profile01', title: 'Profile 01', type: 'link' },
                        { path: '/pages/profile/profile02', title: 'Profile 02', type: 'link' },
                        { path: '/pages/profile/profile03', title: 'Profile 03', type: 'link' },
                    ]
                },
                { path: '/pages/edit-profile', title: 'Edit Profile', type: 'link' },
                {
                    title: 'Email', type: 'sub', active: false,
                    children: [
                        { path: '/pages/email/email-compose', title: 'Email Compose', type: 'link' },
                        { path: '/pages/email/email-inbox', title: 'Email Inbox', type: 'link' },
                        { path: '/pages/email/email-read', title: 'Email Read', type: 'link' },
                    ]
                },
                {
                    title: 'Pricing', type: 'sub', active: false,
                    children: [
                        { path: '/pages/pricing/pricing01', title: 'Pricing 01', type: 'link' },
                        { path: '/pages/pricing/pricing02', title: 'Pricing 02', type: 'link' },
                        { path: '/pages/pricing/pricing03', title: 'Pricing 03', type: 'link' },
                    ]
                },
                {
                    title: 'Invoice', type: 'sub', active: false,
                    children: [
                        { path: '/pages/invoice/invoice-list', title: 'Invoice List', type: 'link' },
                        { path: '/pages/invoice/invoice01', title: 'Invoice 01', type: 'link' },
                        { path: '/pages/invoice/invoice02', title: 'Invoice 02', type: 'link' },
                        { path: '/pages/invoice/invoice03', title: 'Invoice 03', type: 'link' },
                        { path: '/pages/invoice/add-invoice', title: 'Add Invoice', type: 'link' },
                        { path: '/pages/invoice/edit-invoice', title: 'Edit Invoice', type: 'link' },
                    ]
                },
                {
                    title: 'Blog', type: 'sub', active: false,
                    children: [
                        { path: '/pages/blog/blog01', title: 'Blog 01', type: 'link' },
                        { path: '/pages/blog/blog02', title: 'Blog 02', type: 'link' },
                        { path: '/pages/blog/blog03', title: 'Blog 03', type: 'link' },
                        { path: '/pages/blog/blog-styles', title: 'Blog Styles', type: 'link' },
                    ]
                },
                { path: '/pages/gallery', title: 'Gallery', type: 'link' },
                { path: '/pages/faqs', title: 'FAQS', type: 'link' },
                { path: '/pages/terms', title: 'Terms', type: 'link' },
                { path: '/pages/empty-page', title: 'Empty Page', type: 'link' },
                { path: '/pages/search', title: 'Search', type: 'link' },
            ]
        },
        {
            title: 'E-Commerce', icon: 'shopping-cart', type: 'sub', badgeType: 'danger', badgeValue: '3', active: false,
            children: [
                { path: '/ecommerce/products', title: 'Products', type: 'link' },
                { path: '/ecommerce/product-details', title: 'Product Details', type: 'link' },
                { path: '/ecommerce/shopping-cart', title: 'Shopping Cart', type: 'link' },
            ]
        },
        {
            title: 'Basic Elements', icon: 'cpu', type: 'sub', active: false,
            children: [
                { path: '/basic-elements/colors', title: 'Colors', type: 'link' },
                { path: '/basic-elements/flex-items', title: 'Flex Items', type: 'link' },
                { path: '/basic-elements/height', title: 'Height', type: 'link' },
                { path: '/basic-elements/border', title: 'Border', type: 'link' },
                { path: '/basic-elements/display', title: 'Display', type: 'link' },
                { path: '/basic-elements/margin', title: 'Margin', type: 'link' },
                { path: '/basic-elements/padding', title: 'Padding', type: 'link' },
                { path: '/basic-elements/typography', title: 'Typhography', type: 'link' },
                { path: '/basic-elements/width', title: 'Width', type: 'link' },

            ]
        },
        {
            title: 'Account', icon: 'users', type: 'sub', active: false,
            children: [
                {
                    title: 'Login', type: 'sub', active: false,
                    children: [
                        { path: '/custom-pages/login/login01', title: 'Login 01', type: 'link' },
                        { path: '/custom-pages/login/login02', title: 'Login 02', type: 'link' },
                        { path: '/custom-pages/login/login03', title: 'Login 03', type: 'link' },
                    ]
                },
                {
                    title: 'Register', type: 'sub', active: false,
                    children: [
                        { path: '/custom-pages/register/register01', title: 'Register 01', type: 'link' },
                        { path: '/custom-pages/register/register02', title: 'Register 02', type: 'link' },
                        { path: '/custom-pages/register/register03', title: 'Register 03', type: 'link' },
                    ]
                },
                {
                    title: 'Forget Password', type: 'sub', active: false,
                    children: [
                        { path: '/custom-pages/forget-password/forget-password01', title: 'Forget Password 01', type: 'link' },
                        { path: '/custom-pages/forget-password/forget-password02', title: 'Forget Password 02', type: 'link' },
                        { path: '/custom-pages/forget-password/forget-password03', title: 'Forget Password 03', type: 'link' },
                    ]
                },
                {
                    title: 'Reset Password', type: 'sub', active: false,
                    children: [
                        { path: '/custom-pages/reset-password/reset-password01', title: 'Reset Password 01', type: 'link' },
                        { path: '/custom-pages/reset-password/reset-password02', title: 'Reset Password 02', type: 'link' },
                        { path: '/custom-pages/reset-password/reset-password03', title: 'Reset Password 03', type: 'link' },
                    ]
                },
                {
                    title: 'Lock Screen', type: 'sub', active: false,
                    children: [
                        { path: '/custom-pages/lockscreen/lockscreen01', title: 'Lock Screen 01', type: 'link' },
                        { path: '/custom-pages/lockscreen/lockscreen02', title: 'Lock Screen 02', type: 'link' },
                        { path: '/custom-pages/lockscreen/lockscreen03', title: 'Lock Screen 03', type: 'link' },
                    ]
                },
                { path: '/custom-pages/under-construction', title: 'Under Construction', type: 'link' },
                { path: '/custom-pages/comingsoon', title: 'Coming Soon', type: 'link' },
            ]
        },
        {
            title: 'Error Pages', icon: 'help-circle', type: 'sub', active: false,
            children: [
                { path: '/error/error400', title: '400', type: 'link' },
                { path: '/error/error401', title: '401', type: 'link' },
                { path: '/error/error403', title: '403', type: 'link' },
                { path: '/error/error404', title: '404', type: 'link' },
                { path: '/error/error500', title: '500', type: 'link' },
                { path: '/error/error503', title: '503', type: 'link' },
            ]
        }        
    ];

    //array
    items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
}

// account =  users
// Basic elemeent = cpu
// submenu  =  sliders