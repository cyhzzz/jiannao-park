package com.jiannao.brain;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
  /**
   * 拦截系统/实体返回键，转交 WebView 内的 JS 处理函数 window.__onAndroidBack 决定行为：
   * - 返回 true ：已在应用内处理（游戏/记录页→首页、完成弹窗→关闭），留在应用内；
   * - 返回 false：交由原生默认行为退出应用（首页时退出至桌面）。
   * 这样系统返回键与左上角返回按钮语义一致，避免误触直接退出。
   */
  @Override
  public void onBackPressed() {
    Bridge bridge = getBridge();
    WebView webView = (bridge != null) ? bridge.getWebView() : null;
    if (webView == null) {
      super.onBackPressed();
      return;
    }
    webView.evaluateJavascript(
      "(function(){ return (typeof window.__onAndroidBack === 'function') ? !!window.__onAndroidBack() : false; })()",
      value -> {
        boolean handled = false;
        if (value != null) {
          try { handled = Boolean.parseBoolean(value); } catch (Exception ignored) {}
        }
        if (!handled) {
          // 未被 WebView 拦截：交由系统默认行为（退出应用至桌面）
          finish();
        }
      }
    );
  }
}
