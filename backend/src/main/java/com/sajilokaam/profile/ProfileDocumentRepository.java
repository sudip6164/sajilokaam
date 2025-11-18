package com.sajilokaam.profile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfileDocumentRepository extends JpaRepository<ProfileDocument, Long> {
    List<ProfileDocument> findByUserIdAndProfileType(Long userId, ProfileType profileType);
}



