/*
 * File:          ScheduleWatcher.ts
 * Project:       adoscopejs
 * Author:        Paradox
 *
 * Copyright (c) 2019 Paradox.
 */

import * as path from 'path'
import * as _ from 'lodash'
import { scheduledJobs } from 'node-schedule'

import { HelpersContract as Helpers } from '../Contracts/Helpers'

import { Job } from '../Contracts'
import EntryType from '../EntryType'
import Adoscope from '../Adoscope'
import Watcher from './Watcher'

// TODO: Improve this class to use other schedulers.

/**
 * Class used to listen to registered jobs AKA tasks
 * under **App/Tasks** namespace.
 *
 * For now, it handles only schedulers using
 * node-schedule as base package.
 *
 * @export
 *
 * @class ScheduleWatcher
 *
 * @extends {Watcher}
 */
export default class ScheduleWatcher extends Watcher {

  /**
   * Creates an instance of ScheduleWatcher.
   *
   * @param {Helpers} _helpers
   * @param {{[jobName: string]: Job}} [_scheduledJobs=scheduledJobs]
   *
   * @memberof ScheduleWatcher
   */
  constructor (
    private _app: Adoscope,
    private _helpers: Helpers,
    private _scheduledJobs: {[jobName: string]: Job} = scheduledJobs
  ) {
    super(_app.config)
  }

  public get type (): EntryType {
    return EntryType.SCHEDULE
  }

  /**
   * Listens to **scheduled** and **run** events on jobs.
   * Stores jobs details into database.
   *
   * @method record
   *
   * @memberof ScheduleWatcher
   */
  public record (): void {
    // @ts-ignore
    Object.values(this._scheduledJobs).every(async (job: Job) => {
      job.on('scheduled', async (date: Date) => {
        if (!(await this._app.isRecording())) {
          return false
        }

        const name = job.name

        const { uuid } = await this._store(
          EntryType.SCHEDULE,
          {
            name,
            state: 'scheduled',
            schedule: require(path.join(this._helpers.appRoot(), 'app', 'Tasks', name)).schedule,
            date
          }
        )

        job.uuid = uuid
      })

      job.on('run', async (date: Date) => {
        const uuid = job.uuid

        if (uuid) {
          let jobEntry = await this._find(uuid)

          if (jobEntry) {
            _.merge(jobEntry.content, { state: 'run', date })

            if (await jobEntry.save()) {
              job.uuid = null
            }
          }
        }
      })
    })
  }

}
