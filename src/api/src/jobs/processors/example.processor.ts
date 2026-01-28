export const name = 'example';

export const processor = async (job: any) => {
  // faz algo
  return { ok: true, jobId: job.id, data: job.data };
};
