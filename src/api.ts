/**

Types to represent Tekton resources.

This file is constructed by hand, by taking the Go type definitions
from github.com/tektoncd/pipeline/pkg/apis/{pipeline,resource} and
transliterating them to TypeScript.

 - `type Foo struct` in Go ends up as TypeScript `class Foo`

 - each class property has the name given for its JSON encoding in its
   Go struct tag, since these properties will be encoded directly

 - if a struct field is marked `optional` in a comment, it's nullable
   here

 - if a field is a pointer or a slice, it's nullable here

 - any Go types that exist only to help JSON decoding (e.g.,
   ArrayOrString) are elided here (typically replaced with a union
   type)

 - a type alias + consts, usually used to encode an non-int enum in
   Go, is an enum here (e.g., `ParamType`)

 - in some cases, a struct embeds another struct and is marked
   `inline` (e.g., TaskResource embeds ResourceDeclaration); I have
   made the class corresponding to the outer struct extend the
   other. The exception is meta.v1.TypeMeta, which I have just inlined
   myself.

 - Status fields and types are omitted, on the basis that they are
   reported by the runtime system rather than defined in
   configuration. There may arise use cases for e.g., processing a
   status with `jk`, in which case I will have to overcome my
   laziness.

Top-level objects (those with meta.v1.ObjectMeta) get a constructor
taking a name, then the fields as one big object; e.g.,

    const p = new Pipeline('foo', { spec: ... });

Other objects just get the fields argument:

    const s = new PipelineSpec({ tasks: [ ... ] });

There's a fair few classes that are just `{ name, value }`; those get
a constructor with arguments for the mandatory fields. I have not done
this everywhere -- just where the fields are conventional, like a name
and a value or a type.

Lastly: List types get a constructor with an `items` argument.

*/

// Requires jkcfg/kubernetes for meta.v1 and core.v1
import { core, meta } from '@jkcfg/kubernetes/api';

// the type meta.v1.Duration doesn't exist in @jkcfg/kubernetes,
// possibly because it uses an old version of the Kubernetes API
// (1.13). For our purposes, it's just a string (like '4s' or '12h').
type Duration = string;

// github.com/tektoncd/pipeline/pkg/apis/pipeline

export namespace tekton /* tekton.dev */ {

  // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/paths.go
  export const WorkspaceDir = '/workspace';
  export const DefaultResultPath = '/tekton/results';

  // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/storagetypes.go
  export const ArtifactStorageBucketType = 'bucket';
  export const ArtifactStoragePVCType = 'pvc';

  export namespace v1beta1 {

    // Used for the API version in all the classes
    const version = "tekton.dev/v1beta1";

    // Preliminaries: these get borrowed from the prior (v1alpha1)
    // version of the API, and rebadged to this version. They also go
    // in a different package, but have the same Kubernetes API group.

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1

    // PipelineResource types (pipelineresource_types.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1/pipeline_resource_types.go
    export enum PipelineResourceType {
      Git = "git",
      Storage = "storage",
      Image = "image",
      Cluster = "cluster",
      PullRequest = "pullRequest",
      CloudEvent = "cloudEvent",
      GCS = "gcs",
      BuildGCS = "build-gcs",
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L73
    export class PipelineResource {
      readonly apiVersion: string = version;
      readonly kind: string = "PipelineResource";
      metadata?: meta.v1.ObjectMeta;
      spec: PipelineResourceSpec;
      // omitted: status, which is decrecated anyway

      constructor(name: string, fields: PipelineResource) {
        Object.assign(this, fields);
        this.metadata = Object.assign(this.metadata || {}, { name });
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L95
    export class PipelineResourceSpec {
      type: PipelineResourceType;
      params: ResourceParam[];
      secretParams?: SecretParam[];

      constructor(fields: PipelineResourceSpec) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L104
    export class SecretParam {
      constructor(public fileName: string,
                  public secretKey: string,
                  public secretName: string) {}
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L112
    export class ResourceParam {
      constructor(public name: string, public value: string) {}
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L122
    export class ResourceDeclaration {
      name: string;
      type: PipelineResourceType;
      description?: string;
      targetPath?: string;
      optional?: boolean = false;

      constructor(fields: ResourceDeclaration) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L147
    export class PipelineResourceList {
      readonly apiVersion: string = version;
      readonly kind: string = "PipelineResourceList";
      metadata?: meta.v1.ListMeta;

      constructor(public items: PipelineResource[]) {}
    }

    // Now to the main event: most of the types are in
    //    https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1

    // ClusterTask types (clustertask_types.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/cluster_task_types.go#L31
    export class ClusterTask {
      readonly apiVersion: string = version;
      readonly kind: string = "ClusterTask";
      metadata?: meta.v1.ObjectMeta;
      spec?: TaskSpec;

      constructor(name: string, fields: ClusterTask) {
        Object.assign(this, fields);
        this.metadata = Object.assign(this.metadata || {}, { name });
      }
    }

    export class ClusterTaskList {
      readonly apiVersion: string = version;
      readonly kind: string = "ClusterTaskList";
      metadata?: meta.v1.ListMeta;

      constructor(public items: ClusterTask[]) {}
    }

    // Param types

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/param_types.go#L75
    export enum ParamType {
      String = "string",
      Array = "array",
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/param_types.go#L30
    export class ParamSpec {
      name: string;
      type?: ParamType = ParamType.String;
      description?: string;
      default?: string | string[];

      constructor(fields: ParamSpec) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/param_types.go#L65
    export class Param {
      constructor(public name: string, public value: string | string[]) {}
    }

    // Pipelines (pipeline_types.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L31
    export class Pipeline {
      readonly apiVersion: string = version;
      readonly kind: string = "Pipeline";
      metadata?: meta.v1.ObjectMeta;
      spec?: PipelineSpec;
      // omitted: status is deprecated

      constructor(name: string, fields: Pipeline) {
        Object.assign(this, fields);
        this.metadata = Object.assign(this.metadata || {}, { name });
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L67
    export class PipelineSpec {
      resources?: PipelineDeclaredResource[];
      tasks?: PipelineTask[];
      params?: ParamSpec[];

      constructor(fields: PipelineSpec) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L80
    export class PipelineTask {
      name: string;
      taskRef?: TaskRef;   // )
      taskSpec?: TaskSpec; // ) one or other
      conditions?: PipelineTaskCondition[];
      retries?: number;
      runAfter?: string[];
      resources?: PipelineTaskResources;
      params?: Param[];

      constructor(fields: PipelineTask) {
        if (fields && fields.taskRef && fields.taskSpec) {
          throw new Error('cannot construct a PipelineTask with both taskRef and taskSpec; pick one');
        }
        Object.assign(this, fields);
      }
    }

    // omitted: PipelineTaskParam, which doesn't appear to be used

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L155
    export class PipelineTaskCondition {
      conditionRef: string;
      params?: Param[];
      resources?: PipelineTaskInputResource[];

      constructor(fields: PipelineTaskCondition) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L170
    export class PipelineDeclaredResource {
      constructor(public name: string, public type: PipelineResourceType) {}
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L182
    export class PipelineTaskResources {
      inputs?: PipelineTaskInputResource[];
      outputs?: PipelineTaskOutputResource[];

      constructor(fields: PipelineTaskResources) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L194
    export class PipelineTaskInputResource {
      name: string;
      resource: string;
      from?: string[];

      constructor(fields: PipelineTaskInputResource) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L208
    export class PipelineTaskOutputResource {
      name: string;
      resource: string;

      constructor(fields: PipelineTaskOutputResource) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L217
    export class PipelineList {
      readonly apiVersion: string = version;
      readonly kind: string = "PipelineList";
      metadata?: meta.v1.ListMeta;

      constructor(public items: Pipeline[]) {}
    }

    // PipelineRun types (pipelinerun_types.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipelinerun_types.go#L50
    export class PipelineRun {
      readonly apiVersion: string = version;
      readonly kind: string = "PipelineRun";
      metadata?: meta.v1.ObjectMeta;
      spec?: PipelineRunSpec;
      // omitted: status

      constructor(name: string, fields: PipelineRun) {
        Object.assign(this, fields);
        this.metadata = Object.assign(this.metadata || {}, { name });
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipelinerun_types.go#L130
    export class PipelineRunSpec {
      pipelineRef?: PipelineRef;   // )
      pipelineSpec?: PipelineSpec; // ) one or other
      resources?: PipelineResourceBinding;
      params?: Param[];
      serviceAccountName?: string;
      serviceAccountNames?: PipelineRunSpecServiceAccountName[]; // ?
      timeout?: Duration;
      podTemplate?: PodTemplate;
      workspaces?: WorkspaceBinding[];

      constructor(fields: PipelineRunSpec) {
        Object.assign(this, fields);
      }
    }

    // Omitted:
    //  - PipelineRunSpecStatus (_spec_ status?)
    //  - PipelineRunStatus
    //  - PipelineRunStatusFields
    //  - PipelineRunTaskRunStatus (are you kidding me)
    //  - PipelineRunConditionCheckStatus

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipelinerun_types.go#L171
    export class PipelineRef {
      name: string
      apiVersion?: string;

      constructor(fields: PipelineRef) {
        Object.assign(this, fields);
      }

    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipelinerun_types.go#L265
    export class PipelineRunSpecServiceAccountName {
      taskName: string;
      serviceAccountName: string;

      constructor(fields: PipelineRunSpecServiceAccountName) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipelinerun_types.go#L273
    export class PipelineRunList {
      readonly apiVersion: string = version;
      readonly kind: string = "PipelineRunList";
      meta?: meta.v1.ListMeta;
      constructor(public items: PipelineRun[]) {}
    }

    // omitted: PipelineTaskRun (it's status thing?)

    // Pod type (pod.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pod.go#L22
    // aliases Template in
    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/pod/template.go#L27
    export class PodTemplate {
      nodeSelector: { [key: string]: string };
      tolerations?: core.v1.Toleration[];
      affinity?: core.v1.Affinity;
      securityContext?: core.v1.PodSecurityContext;
      volumes?: core.v1.Volume[];
      runtimeClassName?: string;
      automountServiceAccountToken?: boolean;
      // omitted (not in @jkcfg/kubernetes, which is made from v1.13):
      //  - dnsPolicy
      //  - dnsConfig
      enableServiceLinks?: boolean;
      priorityClassName?: string;
      schedulerName?: string;

      constructor(fields: PodTemplate) {
        Object.assign(this, fields);
      }
    }

    // Resource types (resource_types.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/resource_types.go#L36,
    // which aliases types in

    // Since we're here, there's a few other types that are used from the resource package
    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L73

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/resource_types.go#L61
    export class TaskResource extends ResourceDeclaration {
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/resource_types.go#L61
    export class TaskResources {
      inputs?: TaskResource[];
      outputs?: TaskResource[];

      constructor(fields: TaskResources) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/resource_types.go#L80
    export class TaskRunResources {
      inputs?: TaskResourceBinding[];
      outputs?: TaskResourceBinding[];

      constructor(fields: TaskRunResources) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/resource_types.go#L96
    export class PipelineResourceBinding {
      name: string;
      resourceRef?: PipelineResourceRef;   // )
      resourceSpec?: PipelineResourceSpec; // ) one or other

      constructor(fields: PipelineResourceBinding) {
        if (fields && fields.resourceRef && fields.resourceSpec) {
          throw new Error('cannot construct a PipelineResourceBinding with both resourceRef and resourceSpec; pick one');
        }
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/resource_types.go#L111
    export class PipelineResourceResult {
      key: string;
      value: string;
      resourceRef: PipelineResourceRef;
      resultType: string; // typed in Go as `type ResultType string`

      constructor(fields: PipelineResourceResult) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/resource_types.go#L122
    export class PipelineResourceRef {
      name: string;
      apiVersion?: string;

      constructor(fields: PipelineResourceRef) {
        Object.assign(this, fields);
      }
    }

    // Task types (task_types.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/task_types.go#L34
    export class Task {
      readonly apiVersion: string = version;
      readonly kind: string = "Task";
      metadata?: meta.v1.ObjectMeta;
      spec?: TaskSpec;

      constructor(name: string, fields: Task) {
        Object.assign(this, fields);
        this.metadata = Object.assign(this.metadata || {}, { name });
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/task_types.go#L57
    export class TaskSpec {
      resources?: TaskResources;
      params?: ParamSpec[];
      steps?: Step[];
      volumes?: core.v1.Volume[];
      stepTemplate?: core.v1.Container[];
      sidecars?: Sidecar[];
      workspaces?: WorkspaceDeclaration[];
      results?: TaskResult[];

      constructor(fields: TaskSpec) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/task_types.go#L94
    export class TaskResult {
      public name: string;
      description?: string;

      constructor(fields: TaskResult) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/task_types.go#L105
    export class Step extends core.v1.Container {
      script?: string;

      constructor(fields: Step) {
        super();
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/task_types.go#L115
    export type Sidecar = Step;

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/task_types.go#L119
    export class TaskList {
      readonly apiVersion: string = version;
      readonly kind: string = "TaskList";
      metadata: meta.v1.ListMeta;

      constructor(public items: Task[]) {}
    }

    export enum TaskKind {
      Task = "Task",
      ClusterTask = "ClusterTask"
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/task_types.go#L128
    export class TaskRef {
      name: string;
      kind: TaskKind;
      apiVersion?: string;

      constructor(fields: TaskRef) {
        Object.assign(this, fields);
      }
    }

    // TaskRun types (taskrun_types.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/taskrun_types.go#L31
    export class TaskRunSpec {
      params?: Param[];
      resources?: TaskRunResources;
      serviceAccountName?: string;
      taskRef?: TaskRef;   // )
      taskSpec?: TaskSpec; // ) one or other
      timeout?: Duration;
      podTemplate: PodTemplate;
      workspaces?: WorkspaceBinding[];

      constructor(fields: TaskRunSpec) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/taskrun_types.go#L59
    // TaskRunSpecStatus omitted, since it's part of runtime status

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/taskrun_types.go#L68
    export class TaskRunImports {
      resources?: TaskResourceBinding[];
      params?: Param[];

      constructor(fields: TaskRunImports) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/taskrun_types.go#L77
    // embeds PipelineResourceBinding
    export class TaskResourceBinding extends PipelineResourceBinding {
      paths?: string[]; // due to be removed

      constructor(fields: PipelineResourceBinding) {
        super(fields);
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/taskrun_types.go#L87
    export class TaskRunOutputs {
      resources?: TaskResourceBinding[];

      constructor(fields: TaskRunOutputs) {
        Object.assign(this, fields);
      }
    }

    // Omitted, because they pertain to runtime status (rather than
    // definition):
    // - TaskRunStatus
    // - TaskRunStatusFields
    // - TaskRunResult
    // - StepState
    // - SidecarState
    // - CloudEventDelivery
    // - CloudEventCondition
    // - CloudEventDeliveryState

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/taskrun_types.go#L247
    export class TaskRun {
      readonly apiVersion: string = version;
      readonly kind: string = "TaskRun";
      metadata?: meta.v1.ObjectMeta;
      spec?: TaskRunSpec;
      // omitted: status

      constructor(name: string, fields: TaskRun) {
        Object.assign(this, fields);
        this.metadata = Object.assign(this.metadata || {}, { name });
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/taskrun_types.go#L261
    export class TaskRunList {
      readonly apiVersion: string = version;
      readonly kind: string = "TaskRunList";
      metadata?: meta.v1.ListMeta;

      constructor(public items: TaskRun[]) {}
    }

    // Workspace types (workspace_types.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/workspace_types.go#L27
    export class WorkspaceDeclaration {
      name: string;
      description?: string;
      mountPath?: string;
      readOnly?: boolean;

      constructor(fields: WorkspaceDeclaration) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/workspace_types.go#L51
    export class WorkspaceBinding {
      name: string;
      subPath?: string;
      persistentVolumeClaim?: core.v1.PersistentVolumeClaimVolumeSource; // )
      emptyDir?: core.v1.EmptyDirVolumeSource;                           // ) one or other
      configMap?: core.v1.ConfigMapVolumeSource;
      secret?: core.v1.SecretVolumeSource;

      constructor(fields: WorkspaceBinding) {
        if (fields && fields.persistentVolumeClaim && fields.emptyDir) {
          throw new Error('cannot construct WorkspaceBinding with both persistentVolumeClaim and emptyDir; pick one');
        }
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/workspace_types.go#L77
    export class WorkspacePipelineDeclaration {
      name: string;
      description?: string;

      constructor(fields: WorkspacePipelineDeclaration) {
        Object.assign(this, fields);
      }
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/workspace_types.go#L89
    export class WorkspacePipelineTaskBinding {
      name: string;
      workspace: string;

      constructor(fields: WorkspacePipelineTaskBinding) {
        Object.assign(this, fields);
      }
    }
  }
}
