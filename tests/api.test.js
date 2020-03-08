import { tekton } from '../src/api';

test('Construct pipeline', () => {
  const pl = new tekton.v1beta1.Pipeline('pipeline1');
  expect(pl.metadata.name).toEqual('pipeline1');
  expect(pl.kind).toEqual("Pipeline");
  expect(pl.apiVersion).toEqual("tekton.dev/v1beta1");
});
