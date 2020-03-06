/**

Types to represent Tekton resources.

This file is constructed by hand, by taking the Go type definitions
from github.com/tektoncd/pipeline/pkg/apis/pipeline[/v1alpha2] and
transliterating them to TypeScript.

 - `type Foo struct` in Go ends up as TypeScript `class Foo`

 - each class property is given the name given for its JSON encoding
   in its Go struct tag

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
      spec: PipelineResourceSpec;
      // omitted: status, which is decrecated anyway
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L95
    export class PipelineResourceSpec {
      type: PipelineResourceType;
      params: ResourceParam[];
      secretParams?: SecretParam[];
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L104
    export class SecretParam {
      fileName: string;
      secretKey: string;
      secretName: string;
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L112
    export class ResourceParam {
      name: string;
      value: string;
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L122
    export class ResourceDeclaration {
      name: string;
      type: PipelineResourceType;
      description?: string;
      targetPath?: string;
      optional?: boolean = false;
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/resource/v1alpha1/pipeline_resource_types.go#L147
    export class PipelineResourceList {
      readonly apiVersion: string = version;
      readonly kind: string = "PipelineResourceList";
      metadata?: meta.v1.ListMeta;
      items: PipelineResource[];
    }

    // Now to the main event: most of the types are in
    //    https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1

    // ClusterTask types (clustertask_types.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/cluster_task_types.go#L31
    export class ClusterTask {
      readonly apiVersion: string = version;
      readonly kind: string = "ClusterTask";
      spec?: TaskSpec;
    }

    export class ClusterTaskList {
      readonly apiVersion: string = version;
      readonly kind: string = "ClusterTaskList";
      meta?: meta.v1.ListMeta;
      items: ClusterTask[];
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
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/param_types.go#L65
    export class Param {
      name: string;
      value: string | string[];
    }

    // Pipelines (pipeline_types.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L31
    export class Pipeline {
      readonly apiVersion: string = version;
      readonly kind: string = "Pipeline";
      metadata?: meta.v1.ObjectMeta;
      spec?: PipelineSpec;
      // omitted: status is deprecated
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L67
    export class PipelineSpec {
      resources?: PipelineDeclaredResource[];
      tasks?: PipelineTask[];
      params?: ParamSpec[];
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L80
    export class PipelineTask {
      name: string;
      taskRef?: TaskRef;   // )
      taskSpec?: TaskSpec; // ) one or other
      conditions?: PipelineTaskCondition[];
      retries?: number;
      runAfter: string[];
      resources?: PipelineTaskResources;
      params?: Param[];
    }

    // omitted: PipelineTaskParam, which doesn't appear to be used

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L155
    export class PipelineTaskCondition {
      conditionRef: string;
      params?: Param[];
      resources?: PipelineTaskInputResource[];
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L170
    export class PipelineDeclaredResource {
      name: string;
      type: PipelineResourceType;
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L182
    export class PipelineTaskResources {
      inputs?: PipelineTaskInputResource[];
      outputs?: PipelineTaskOutputResource[];
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L194
    export class PipelineTaskInputResource {
      name: string;
      resource: string;
      from?: string[];
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L208
    export class PipelineTaskOutputResource {
      name: string;
      resource: string;
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipeline_types.go#L217
    export class PipelineList {
      readonly apiVersion: string = version;
      readonly kind: string = "PipelineList";
      metadata?: meta.v1.ListMeta;
      items: Pipeline[];
    }

    // PipelineRun types (pipelinerun_types.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipelinerun_types.go#L50
    export class PipelineRun {
      readonly apiVersion: string = version;
      readonly kind: string = "PipelineRun";
      meta?: meta.v1.ObjectMeta;
      spec?: PipelineRunSpec;
      // omitted: status
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
    }

    // Omitted:
    //  - PipelineRunSpecStatus (_spec_ status?)
    //  - PipelineRunStatus
    //  - PipelineRunStatusFields
    //  - PipelineRunTaskRunStatus (are you kidding me)
    //  - PipelineRunConditionCheckStatus

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipelinerun_types.go#L171
    export class PipelineRef {
      name: string;
      apiVersion: string;
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipelinerun_types.go#L265
    export class PipelineRunSpecServiceAccountName {
      taskName: string;
      serviceAccountName: string;
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/pipelinerun_types.go#L273
    export class PipelineRunList {
      readonly apiVersion: string = version;
      readonly kind: string = "PipelineRunList";
      meta?: meta.v1.ListMeta;
      items: PipelineRun[];
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
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/resource_types.go#L80
    export class TaskRunResources {
      inputs?: TaskResourceBinding[];
      outputs?: TaskResourceBinding[];
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/resource_types.go#L96
    export class PipelineResourceBinding {
      name: string;
      resourceRef?: PipelineResourceRef;   // )
      resourceSpec?: PipelineResourceSpec; // ) one or other
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/resource_types.go#L111
    export class PipelineResourceResult {
      key: string;
      value: string;
      resourceRef: PipelineResourceRef;
      resultType: string; // typed in Go as `type ResultType string`
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/resource_types.go#L122
    export class PipelineResourceRef {
      name: string;
      apiVersion?: string;
    }

    // Task types (task_types.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/task_types.go#L34
    export class Task {
      readonly apiVersion: string = version;
      readonly kind: string = "Task";
      metadata?: meta.v1.ObjectMeta;
      spec?: TaskSpec;
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
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/task_types.go#L94
    export class TaskResult {
      name: string;
      description?: string;
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/task_types.go#L105
    export class Step extends core.v1.Container {
      script?: string;
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/task_types.go#L115
    export type Sidecar = Step;

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/task_types.go#L119
    export class TaskList {
      readonly apiVersion: string = version;
      readonly kind: string = "TaskList";
      meta: meta.v1.ListMeta;
      items: Task[];
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
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/taskrun_types.go#L59
    // TaskRunSpecStatus omitted, since it's part of runtime status

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/taskrun_types.go#L68
    export class TaskRunImports {
      resources?: TaskResourceBinding[];
      params?: Param[];
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/taskrun_types.go#L77
    // embeds PipelineResourceBinding
    export class TaskResourceBinding extends PipelineResourceBinding {
      paths?: string[]; // due to be removed
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/taskrun_types.go#L87
    export class TaskRunOutputs {
      resources?: TaskResourceBinding[];
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
      spec?: TaskRunSpec;
      // omitted: status
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/taskrun_types.go#L261
    export class TaskRunList {
      readonly apiVersion: string = version;
      readonly kind: string = "TaskRunList";
      metadata?: meta.v1.ListMeta;
      items: TaskRun[];
    }

    // Workspace types (workspace_types.go)

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/workspace_types.go#L27
    export class WorkspaceDeclaration {
      name: string;
      description?: string;
      mountPath?: string;
      readOnly?: boolean;
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/workspace_types.go#L51
    export class WorkspaceBinding {
      name: string;
      subPath?: string;
      persistentVolumeClaim?: core.v1.PersistentVolumeClaimVolumeSource; // )
      emptyDir?: core.v1.EmptyDirVolumeSource;                           // ) one or other
      configMap?: core.v1.ConfigMapVolumeSource;
      secret?: core.v1.SecretVolumeSource;
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/workspace_types.go#L77
    export class WorkspacePipelineDeclaration {
      name: string;
      description?: string;
    }

    // https://github.com/tektoncd/pipeline/blob/v0.11.0-rc1/pkg/apis/pipeline/v1beta1/workspace_types.go#L89
    export class WorkspacePipelineTaskBinding {
      name: string;
      workspace: string;
    }
  }
}
