package com.quizapp.quizBackend.service;

import com.quizapp.quizBackend.dto.response.OptionDTO;
import com.quizapp.quizBackend.dto.response.QuestionDTO;
import com.quizapp.quizBackend.entity.Option;
import com.quizapp.quizBackend.entity.Question;
import com.quizapp.quizBackend.entity.Quiz;
import com.quizapp.quizBackend.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;

    /**
     * Select N random questions from the quiz and shuffle each question's
     * options independently per student.
     *
     * Returns QuestionDTOs that include:
     *  - shuffled options (text only, no correctness flag)
     *  - shuffleMap: list[shuffledIndex] = originalIndex
     *    so the frontend can send back shuffledIndex and we can grade it
     */
    public List<QuestionDTO> getRandomShuffledQuestions(Quiz quiz) {
        List<Question> allQuestions = questionRepository.findByQuizId(quiz.getId());

        // Random selection
        Collections.shuffle(allQuestions);
        int take = Math.min(quiz.getQuestionsPerAttempt(), allQuestions.size());
        List<Question> selected = allQuestions.subList(0, take);

        return selected.stream()
                .map(this::toShuffledDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert a Question to DTO with shuffled options.
     * The shuffleMap at index i tells you which ORIGINAL option index
     * now sits at position i in the shuffled list.
     */
    public QuestionDTO toShuffledDTO(Question question) {
        List<Option> originalOptions = question.getOptions();
        int size = originalOptions.size();

        // Build an index list [0, 1, 2, 3] and shuffle it
        List<Integer> shuffleMap = IntStream.range(0, size)
                .boxed()
                .collect(Collectors.toCollection(ArrayList::new));
        Collections.shuffle(shuffleMap);

        // Build shuffled option DTOs
        List<OptionDTO> shuffledOptions = new ArrayList<>();
        for (int shuffledIdx = 0; shuffledIdx < size; shuffledIdx++) {
            int originalIdx = shuffleMap.get(shuffledIdx);
            shuffledOptions.add(new OptionDTO(shuffledIdx, originalOptions.get(originalIdx).getText()));
        }

        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setText(question.getText());
        dto.setMarks(question.getMarks());
        dto.setOptions(shuffledOptions);
        dto.setShuffleMap(shuffleMap);
        return dto;
    }

    /**
     * Given the shuffleMap and a chosenShuffledIndex,
     * resolve back to the original option index for grading.
     */
    public int resolveOriginalIndex(List<Integer> shuffleMap, int chosenShuffledIndex) {
        return shuffleMap.get(chosenShuffledIndex);
    }
}
