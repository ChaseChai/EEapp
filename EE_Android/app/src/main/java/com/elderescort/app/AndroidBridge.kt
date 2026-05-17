package com.elderescort.app

import android.webkit.JavascriptInterface

class AndroidBridge {

    @JavascriptInterface
    fun onAudioText(text: String) {
        // Called from JS when frontend sends data back to native.
        // Reserved for future bidirectional communication.
    }

    @JavascriptInterface
    fun getStatus(): String {
        return "connected"
    }
}
