const cron = require('node-cron');
const { getEthiopianTime } = require('./timeUtils');

class CronScheduler {
  constructor() {
    this.jobs = new Map();
    this.timezone = 'Africa/Addis_Ababa';
  }

  // Schedule a job to run daily at midnight Ethiopian Time
  scheduleDailyMidnight(name, task) {
    const job = cron.schedule('0 0 * * *', async () => {
      console.log(`[${name}] Starting at midnight EAT:`, getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
      console.log(`[${name}] UTC timestamp:`, new Date().toISOString());
      
      try {
        await task();
        console.log(`[${name}] Completed successfully at:`, getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
      } catch (error) {
        console.error(`[${name}] Failed:`, error);
        console.error(`[${name}] Error timestamp:`, new Date().toISOString());
      }
    }, {
      timezone: this.timezone,
      scheduled: false
    });

    this.jobs.set(name, job);
    return job;
  }

  // Schedule a job to run at a specific time daily
  scheduleDailyAt(name, hour, minute, task) {
    const cronExpression = `${minute} ${hour} * * *`;
    
    const job = cron.schedule(cronExpression, async () => {
      console.log(`[${name}] Starting at ${hour}:${minute} EAT:`, getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
      console.log(`[${name}] UTC timestamp:`, new Date().toISOString());
      
      try {
        await task();
        console.log(`[${name}] Completed successfully at:`, getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
      } catch (error) {
        console.error(`[${name}] Failed:`, error);
        console.error(`[${name}] Error timestamp:`, new Date().toISOString());
      }
    }, {
      timezone: this.timezone,
      scheduled: false
    });

    this.jobs.set(name, job);
    return job;
  }

  // Schedule a job to run monthly on the 1st at midnight
  scheduleMonthlyMidnight(name, task) {
    const job = cron.schedule('0 0 1 * *', async () => {
      console.log(`[${name}] Monthly job starting at:`, getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
      console.log(`[${name}] UTC timestamp:`, new Date().toISOString());
      
      try {
        await task();
        console.log(`[${name}] Monthly job completed at:`, getEthiopianTime().format('YYYY-MM-DD HH:mm:ss [EAT]'));
      } catch (error) {
        console.error(`[${name}] Monthly job failed:`, error);
        console.error(`[${name}] Error timestamp:`, new Date().toISOString());
      }
    }, {
      timezone: this.timezone,
      scheduled: false
    });

    this.jobs.set(name, job);
    return job;
  }

  // Start a specific job
  startJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.start();
      console.log(`[${name}] Job started`);
    } else {
      console.error(`[${name}] Job not found`);
    }
  }

  // Stop a specific job
  stopJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      console.log(`[${name}] Job stopped`);
    } else {
      console.error(`[${name}] Job not found`);
    }
  }

  // Start all jobs
  startAllJobs() {
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`[${name}] Job started`);
    });
    console.log(`All ${this.jobs.size} cron jobs started with Ethiopian timezone`);
  }

  // Stop all jobs
  stopAllJobs() {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`[${name}] Job stopped`);
    });
  }

  // Get job status
  getJobStatus(name) {
    const job = this.jobs.get(name);
    return job ? job.running : false;
  }

  // List all jobs
  listJobs() {
    const jobList = [];
    this.jobs.forEach((job, name) => {
      jobList.push({
        name,
        running: job.running,
        timezone: this.timezone
      });
    });
    return jobList;
  }
}

// Create singleton instance
const cronScheduler = new CronScheduler();

module.exports = cronScheduler;