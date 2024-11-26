<template>
  <div class="container mx-auto p-6">
    <!-- 標題 -->
    <h1 class="text-3xl font-semibold mb-6 text-center">Roboflow Model Deployment</h1>

    <!-- 圖片上傳 -->
    <div class="flex justify-center mb-4">
      <input type="file" @change="onFileChange" accept="image/*" class="border rounded-lg p-2" ref="fileInput" />
    </div>

    <!-- 預測按鈕 -->
    <div class="flex justify-center mb-6">
      <button
        @click="predict"
        :disabled="isLoading"
        class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        Predict
      </button>
    </div>

    <!-- 清除按鈕 -->
    <div class="flex justify-center mb-6">
      <button
        @click="clearAll"
        :disabled="isLoading"
        class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
      >
        Clear
      </button>
    </div>

    <!-- Loading 動畫 -->
    <div v-if="isLoading" class="flex justify-center mb-6">
      <div class="loader"></div>
    </div>

    <!-- 圖片顯示區域 -->
    <div id="imageDisplayContainer" class="flex flex-wrap justify-center gap-6" v-if="imageSrc || predictionSrc">
      <!-- 原始圖片 -->
      <div class="max-w-lg w-full">
        <h3 class="text-xl font-medium text-center mb-2">Original Image:</h3>
        <img class="w-full h-auto border rounded-lg" v-if="imageSrc" :src="imageSrc" />
      </div>

      <!-- 預測結果圖片 -->
      <div class="max-w-lg w-full" v-if="predictionSrc">
        <h3 class="text-xl font-medium text-center mb-2">Prediction Results:</h3>
        <img class="w-full h-auto border rounded-lg" :src="predictionSrc" />
      </div>
    </div>

    <!-- 錯誤信息 -->
    <div v-if="errorMessage" class="text-red-600 text-center mt-4">
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      imageSrc: null, // 用來顯示原始圖片
      predictionSrc: null, // 用來顯示預測結果圖片
      errorMessage: '', // 用來顯示錯誤信息
      isLoading: false, // 控制是否顯示 loading 動畫
    };
  },
  methods: {
    // 圖片上傳後觸發的事件
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageSrc = reader.result; // 設置原始圖片
        };
        reader.readAsDataURL(file);
      }
    },

    // 預測方法
    async predict() {
      if (!this.imageSrc) {
        this.errorMessage = 'Please select an image file.';
        return;
      }

      // 設置 loading 狀態
      this.isLoading = true;
      this.errorMessage = '';

      // 將圖片轉為 Base64（去除前綴）
      const base64Image = this.imageSrc.split(',')[1];

      try {
        // 發送圖片到 Roboflow API
        const response = await fetch('https://detect.roboflow.com/infer/workflows/test-ir3ky/custom-workflow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: 'XPB0CwxqHdZIbAP5idh2', // 在此處填入您的 API 密鑰
            inputs: {
              image: {
                type: 'base64',
                value: base64Image,
              },
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error: ${response.status} - ${response.statusText} - ${errorData}`);
        }

        const data = await response.json();

        // 顯示帶有預測框的圖片
        if (data.outputs && data.outputs[0].bounding_box_visualization) {
          this.predictionSrc = `data:image/jpeg;base64,${data.outputs[0].bounding_box_visualization.value}`;
        } else {
          this.errorMessage = 'No bounding box visualization available.';
        }
      } catch (error) {
        console.error(error);
        this.errorMessage = `Error: ${error.message}`;
      } finally {
        this.isLoading = false; // 結束 loading 狀態
      }
    },

    // 清除所有資料並重設選擇圖片
    clearAll() {
      this.imageSrc = null;
      this.predictionSrc = null;
      this.errorMessage = '';
      this.isLoading = false; // 確保重設時關閉 loading
      this.$refs.fileInput.value = ''; // 重設檔案輸入欄位
    },
  },
};
</script>

<style>
/* Loading 動畫樣式 */
.loader {
  border: 4px solid #f3f3f3; /* 淺色背景 */
  border-top: 4px solid #3498db; /* 深色前景 */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
