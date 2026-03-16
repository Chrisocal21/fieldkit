'use client'

import { Job } from '@/store/jobStore'
import JobCard from './JobCard'

interface JobListProps {
  jobs: Job[]
  onJobClick: (job: Job) => void
}

export default function JobList({ jobs, onJobClick }: JobListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onClick={onJobClick} />
      ))}
    </div>
  )
}
