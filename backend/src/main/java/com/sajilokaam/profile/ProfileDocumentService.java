package com.sajilokaam.profile;

import com.sajilokaam.profile.dto.ProfileDocumentRequest;
import com.sajilokaam.user.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ProfileDocumentService {

    private final ProfileDocumentRepository profileDocumentRepository;

    public ProfileDocumentService(ProfileDocumentRepository profileDocumentRepository) {
        this.profileDocumentRepository = profileDocumentRepository;
    }

    public ProfileDocument addDocument(User user, ProfileDocumentRequest request) {
        ProfileDocument document = new ProfileDocument();
        document.setUser(user);
        document.setProfileType(request.getProfileType());
        document.setDocumentType(request.getDocumentType());
        document.setFileName(request.getFileName());
        document.setFileUrl(request.getFileUrl());
        document.setStatus("SUBMITTED");
        return profileDocumentRepository.save(document);
    }

    public List<ProfileDocument> getDocuments(User user, ProfileType profileType) {
        if (user == null || user.getId() == null) {
            return List.of();
        }
        return getDocuments(user.getId(), profileType);
    }

    public List<ProfileDocument> getDocuments(Long userId, ProfileType profileType) {
        if (userId == null) {
            return List.of();
        }
        return profileDocumentRepository.findByUserIdAndProfileType(userId, profileType);
    }

    @SuppressWarnings("null")
    public void attachDocumentsToProfile(User user, List<Long> documentIds, String status) {
        List<Long> ids = (documentIds == null ? List.<Long>of() : documentIds)
                .stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        Iterable<ProfileDocument> foundDocuments = profileDocumentRepository.findAllById(ids);
        List<ProfileDocument> documents = new ArrayList<>();
        foundDocuments.forEach(documents::add);
        documents = documents.stream()
                .filter(doc -> doc.getUser() != null && doc.getUser().getId() != null && doc.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());

        for (ProfileDocument document : documents) {
            document.setStatus(status);
        }
        if (!documents.isEmpty()) {
            profileDocumentRepository.saveAll(documents);
        }
    }
}


