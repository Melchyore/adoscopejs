/*
 * File:          adoscope.js
 * Project:       adoscope
 * Created Date:  19/04/2019 1:39:17
 * Author:        Paradox
 *
 * Last Modified: 19/04/2019 2:10:37
 * Modified By:   Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import Vue from 'vue'
//import axios from 'axios'
import Routes from './routes'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

new Vue({
  el: '#adoscope',

  router: new VueRouter({
    routes: Routes,
    mode: 'history',
    base: '/' + window.Adoscope.path + '/',
  }),

  data () {
    return {
      autoLoadsNewEntries: false,
      recording: Adoscope.recording
    }
  },

  methods: {
    autoLoadNewEntries () {

    },

    toggleRecording () {

    }
  }
})
