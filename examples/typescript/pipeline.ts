import { valuesForGenerate } from '@jkcfg/kubernetes/generate';
import { tekton } from '@jkcfg/tekton/api';

const t = new tekton.v1beta1.Task('say-hello', {
  spec: new tekton.v1beta1.TaskSpec({
    params: [{ name: 'who', 'description': 'Whom to greet', default: 'kitty' }],
    steps: [{
      name: 'say',
      image: 'alpine',
      command: ['/bin/echo'],
      args: ['Hello ${inputs.params.who}'],
    }],
  }),
});

const p = new tekton.v1beta1.Pipeline('hello', {
  spec: new tekton.v1beta1.PipelineSpec({
    tasks: [{
      name: 'say-hello-world',
      taskRef: {
        kind: tekton.v1beta1.TaskKind.Task,
        name: 'say-hello',
      },
      params: [{ name: 'who', value: 'world' }],
    }],
  }),
});

export default valuesForGenerate([t, p]);
