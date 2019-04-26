/*
 * File:          routes.js
 * Project:       adoscope
 * Created Date:  19/04/2019 1:41:43
 * Author:        Paradox
 *
 * Last Modified: 19/04/2019 1:44:41
 * Modified By:   Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

export default [
  { path: '/', redirect: '/requests' },

  {
    path: '/mail/:id',
    name: 'mail-preview',
    component: /*require('./screens/mail/preview').default*/ null
  }
]
