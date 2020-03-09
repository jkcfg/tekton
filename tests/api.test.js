import { tekton } from '../src/api';

test('Construct top-level object', () => {
  const pl = new tekton.v1beta1.Pipeline('pipeline1');
  expect(pl.metadata.name).toEqual('pipeline1');
  expect(pl.kind).toEqual("Pipeline");
  expect(pl.apiVersion).toEqual("tekton.dev/v1beta1");
});

test('Construct value object', () => {
  // use a constructor that just has args for all the fields
  const p = new tekton.v1beta1.SecretParam('file', 'key', 'name');
  expect(p.fileName).toEqual('file');
  expect(p.secretKey).toEqual('key');
  expect(p.secretName).toEqual('name');
});

test('Construct List resource', () => {
  const list = new tekton.v1beta1.PipelineResourceList([
    new tekton.v1beta1.PipelineResource('pipelineres'),
  ]);
  expect(list.items).toHaveLength(1);
  expect(list.items[0].metadata.name).toEqual('pipelineres');
});
