<template>
    <div class="sandbox-container">
        <DynamicTab />
    </div>
</template>

<script>
import DynamicTab from "./dev/DynamicTab"
export default {
    components: { DynamicTab }

}

</script>

<style>
.sandbox-container {
    border: solid 1px black;
    height: 600px;
    width: 500px;
    margin-top: 75px;
    margin-bottom: 150px;
    margin-left:350px;
}
</style>