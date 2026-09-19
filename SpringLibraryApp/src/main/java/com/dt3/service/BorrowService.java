package com.dt3.service;

import com.dt3.pojo.Borrow;
import java.util.List;
import java.util.Map;

public interface BorrowService {

    boolean addBorrow(Map<String, Object> cart, int userId);

    Map<String, Object> getAllBorrows(Map<String, String> params);

    Map<String, Object> getMyBorrows(
            String username,
            Map<String, String> params
    );

    void extendDueDate(int detailId, String newDateStr);

    void revokeBorrow(int detailId);

    Long countAll();

    List<Borrow> getByUserId(Integer userId);
}