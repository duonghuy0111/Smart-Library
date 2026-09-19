
package com.dt3.repository;

import com.dt3.pojo.Transaction;


public interface TransactionRepository {
    void saveTransaction(Transaction transaction);
    boolean checkUserPaid(int userId, int documentId); // kiểm tra xem user đã mua sách này chưa
}
