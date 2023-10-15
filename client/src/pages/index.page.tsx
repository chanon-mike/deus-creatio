import type { JobId } from 'commonTypesWithClient/branded';
import type { JobModel, ProdJobModel, TestJobModel } from 'commonTypesWithClient/models';
import { useEffect, useMemo, useState } from 'react';
import { Loading } from 'src/components/Loading/Loading';
import { apiClient } from 'src/utils/apiClient';
import { returnNull } from 'src/utils/returnNull';
import { BasicHeader } from './@components/BasicHeader/BasicHeader';
import { JobList } from './@components/JobList/JobList';
import styles from './index.module.css';

const Home = () => {
  const [jobs, setJobs] = useState<{ prod: ProdJobModel | null; tests: TestJobModel[] }>();
  const [selectedJobId, setSelectedJobId] = useState<JobId>();
  const sortedJobs = useMemo(
    () => jobs?.tests.sort((a, b) => b.timestamp - a.timestamp) ?? [],
    [jobs]
  );
  const currentJob = useMemo<JobModel | undefined>(
    () => sortedJobs.find((job) => job.id === selectedJobId) ?? sortedJobs[0],
    [selectedJobId, sortedJobs]
  );
  const fetchJobs = () =>
    apiClient.jobs
      .$get()
      .then((res) => setJobs((jobs) => (JSON.stringify(jobs) === JSON.stringify(res) ? jobs : res)))
      .catch(returnNull);

  useEffect(() => {
    fetchJobs();

    const intervalId = window.setInterval(fetchJobs, 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (jobs === undefined) return <Loading visible />;

  return (
    <>
      <BasicHeader />
      <div className={styles.main}>
        <div>
          <div className={styles.jobList}>
            <JobList
              sortedJobs={sortedJobs}
              currentJob={currentJob}
              select={(job) => setSelectedJobId(job.id)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
