/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dt3.controllers;

import com.dt3.configs.VNPayConfig;
import com.dt3.pojo.Transaction;
import com.dt3.service.DocumentService;
import com.dt3.service.TransactionService;
import com.dt3.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin
public class ApiTransactionController {

    @Autowired
    private TransactionService transactionService;

    // 👉 1. API TẠO URL THANH TOÁN VNPAY
    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(@RequestBody Map<String, String> payload) {
        try {
            long amount = Long.parseLong(payload.get("amount")) * 100; 
            String docId = payload.get("documentId");

            String vnp_TxnRef = System.currentTimeMillis() + "_" + docId; 

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", VNPayConfig.vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            
            // 👉 ĐÃ SỬA 1: Bỏ dấu hai chấm (:) để tránh lỗi parse chuỗi của VNPay
            vnp_Params.put("vnp_OrderInfo", "Thanh toan tai lieu ID " + docId);
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);
            vnp_Params.put("vnp_IpAddr", "127.0.0.1");

            // 👉 ĐÃ SỬA 2: Đổi Timezone chuẩn của Việt Nam
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));
            
            cld.add(Calendar.MINUTE, 15);
            vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

            // 👉 ĐÃ SỬA 3: Xử lý mã hóa chữ ký (HashData) bám sát tuyệt đối tài liệu VNPay
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    // Theo chuẩn v2.1.0: fieldName KHÔNG encode trong hashData, fieldValue CÓ encode US_ASCII
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    
                    // Build query string (URL)
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
            
            String queryUrl = query.toString();
            String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
            
            String paymentUrl = VNPayConfig.vnp_Url + "?" + queryUrl;
            
            Map<String, String> response = new HashMap<>();
            response.put("url", paymentUrl);
            
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>("Lỗi tạo thanh toán: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Autowired
    private UserService userService;
    @Autowired
    private DocumentService documentService;
    // 👉 2. API NHẬN KẾT QUẢ TỪ VNPAY ĐỂ LƯU DATABASE (Webhook)
    @PostMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(@RequestBody Map<String, String> payload, Principal principal) {
        String vnp_ResponseCode = payload.get("vnp_ResponseCode");
        String vnp_TxnRef = payload.get("vnp_TxnRef"); // Định dạng đang là: timestamp_docId
        String vnp_Amount = payload.get("vnp_Amount");

        // 00 là mã VNPay trả về khi người dùng quét mã thành công
        if ("00".equals(vnp_ResponseCode)) { 
            try {
                // 1. Tách lấy ID sách từ mã giao dịch
                String[] parts = vnp_TxnRef.split("_");
                int documentId = Integer.parseInt(parts[1]);

                // 2. Lấy thông tin User và Document từ DB
                com.dt3.pojo.User currentUser = userService.getUserByUsername(principal.getName());
                com.dt3.pojo.Document doc = documentService.getDocumentById(documentId);

                // 3. Tạo và lưu lịch sử Transaction
                Transaction t = new Transaction();
                t.setUser(currentUser);
                t.setDocument(doc);
                // VNPay nhân 100 lúc gửi đi, giờ nhận về phải chia 100
                t.setAmount(new java.math.BigDecimal(vnp_Amount).divide(new java.math.BigDecimal(100))); 
                t.setPaymentMethod("VNPAY");
                t.setStatus("SUCCESS");
                
                transactionService.saveTransaction(t);

                // 👉 LƯU Ý CHO BẠN: NẾU THÊM LOGIC CẤP QUYỀN MƯỢN SÁCH VÀO BẢNG `Borrow` THÌ BẠN GỌI Ở ĐÂY LUÔN NHÉ!
                // borrowService.addBorrow(...);

                return new ResponseEntity<>("Thanh toán thành công và đã lưu lịch sử!", HttpStatus.OK);
            } catch (Exception e) {
                return new ResponseEntity<>("Lỗi lưu giao dịch: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            return new ResponseEntity<>("Giao dịch bị hủy hoặc thất bại", HttpStatus.BAD_REQUEST);
        }
    }

    // API kiểm tra xem User cụ thể đã từng mua cuốn sách này chưa
    // URL mẫu: /api/transactions/check?userId=2&documentId=5
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkUserPaid(@RequestParam int userId, @RequestParam int documentId) {
        boolean hasPaid = this.transactionService.checkUserPaid(userId, documentId);
        return new ResponseEntity<>(hasPaid, HttpStatus.OK);
    }
}
