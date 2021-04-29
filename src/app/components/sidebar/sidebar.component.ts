import { Component, Input } from '@angular/core';

import { SidebarComponent as BaseSidebarComponent } from 'theme/components/sidebar';

@Component({
  selector: 'app-sidebar',
  styleUrls: ['../../../theme/components/sidebar/sidebar.component.scss', './sidebar.component.scss'],
  templateUrl: '../../../theme/components/sidebar/sidebar.component.html',
})
export class SidebarComponent extends BaseSidebarComponent {
  public title = 'DenetciApp';
  public menu = [
    { name: 'Anasayfa', link: '/app/dashboard', icon: 'home' },
    { name: 'Yapılan Raporlamalar', link: '/app/reports', icon: 'report' },
    { name: 'Soru İşlemleri', link: '/app/questions', icon: 'view_quilt' },
    // { name: 'Custom Dashboard', link: '/app/dashboard-custom', icon: 'view_quilt' },
    // {
    //   name: 'UI',
    //   children: [
    //     ...[
    //       'buttons',
    //       'cards',
    //       'colors',
    //       'forms',
    //       'icons',
    //       'typography',
    //       'tables',
    //     ].map(ui => ({
    //       name: ui[0].toUpperCase() + ui.slice(1),
    //       link: `/ui/${ui}`,
    //     })),
    //     {
    //       name: 'Right sidebar',
    //       link: '/ui/right-sidebar',
    //     },
    //   ],
    //   icon: 'view_comfy',
    // },
    // { name: 'Components', link: '/app/components', icon: 'developer_board' },
    // { name: 'Hesabım', link: '/app/forms', icon: 'person' },
    // {
    //   name: 'Maps', icon: 'map', children: [
    //   { name: 'Simple map', link: '/maps/simple' },
    //   { name: 'Advanced map', link: '/maps/advanced' },
    //   ],
    // },
    // { name: 'Charts', link: '/app/charts', icon: 'multiline_chart' },
    // {
    //   name: 'Sayfalar', children: [
    //   { name: 'Giriş Yap', link: '/pages/login' },
    //   { name: '404', link: '/pages/error' },
    //   ],
    //   icon: 'pages',
    // },
  ];
}
